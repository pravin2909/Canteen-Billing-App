const db = require('../config/db');
const gateway = require('./mockGateway');
const { httpError } = require('../middleware/errorHandler');

// Create a PENDING order from a cart.
// SECURITY: prices and the total are taken ENTIRELY from the database, never
// from the client. The client only sends item ids and quantities.
async function createPendingOrder(userId, items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw httpError(400, 'Cart is empty.');
    }

    // Normalise + validate the incoming quantities.
    const wanted = new Map();
    for (const it of items) {
        const id = Number(it.id);
        const qty = Number(it.quantity);
        if (!Number.isInteger(id) || !Number.isInteger(qty) || qty <= 0) {
            throw httpError(400, 'Invalid cart item.');
        }
        wanted.set(id, (wanted.get(id) || 0) + qty);
    }

    const ids = [...wanted.keys()];
    const { rows: menuRows } = await db.query(
        'SELECT id, name, price, stock_quantity, is_available FROM menu_items WHERE id = ANY($1)',
        [ids]
    );
    const byId = new Map(menuRows.map((r) => [r.id, r]));

    // Validate availability + stock, and compute the authoritative total.
    let total = 0;
    const lineItems = [];
    for (const [id, qty] of wanted) {
        const m = byId.get(id);
        if (!m) throw httpError(400, `Item ${id} is no longer on the menu.`);
        if (!m.is_available) throw httpError(400, `${m.name} is currently unavailable.`);
        if (m.stock_quantity < qty) {
            throw httpError(400, `Only ${m.stock_quantity} of ${m.name} left in stock.`);
        }
        total += m.price * qty;
        lineItems.push({ id, name: m.name, quantity: qty, price: m.price });
    }

    // Persist the order + its items (no stock change yet — that happens on payment).
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id, created_at',
            [userId, total, 'pending']
        );
        const orderId = rows[0].id;

        for (const li of lineItems) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1,$2,$3,$4)',
                [orderId, li.id, li.quantity, li.price]
            );
        }

        // Ask the (mock) gateway to create a payment order.
        const pay = gateway.createOrder(total, 'INR');
        await client.query(
            `INSERT INTO payments (order_id, provider, provider_order_id, amount, status)
             VALUES ($1, 'mock', $2, $3, 'created')`,
            [orderId, pay.providerOrderId, total]
        );

        await client.query('COMMIT');

        return {
            order: { id: orderId, total, status: 'pending', items: lineItems },
            payment: {
                providerOrderId: pay.providerOrderId,
                amount: pay.amount,
                currency: pay.currency,
                key: pay.key,
            },
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { createPendingOrder };
