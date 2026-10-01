const db = require('../config/db');
const gateway = require('./mockGateway');
const { httpError } = require('../middleware/errorHandler');

// Runs the (mock) charge, verifies the signature, then fulfils the order:
// decrements stock, marks the order paid, and assigns a pickup token — all in
// one transaction so stock can never go negative or be double-spent.
async function payAndFulfill(userId, { providerOrderId, method = 'card', simulateFailure = false }) {
    if (!providerOrderId) throw httpError(400, 'providerOrderId is required.');

    // Look up the payment + its order and make sure it belongs to this user.
    const { rows } = await db.query(
        `SELECT p.id AS payment_id, p.amount, p.status AS payment_status,
                o.id AS order_id, o.user_id, o.status AS order_status
         FROM payments p
         JOIN orders o ON o.id = p.order_id
         WHERE p.provider_order_id = $1`,
        [providerOrderId]
    );
    if (rows.length === 0) throw httpError(404, 'Payment order not found.');
    const rec = rows[0];
    if (rec.user_id !== userId) throw httpError(403, 'This order does not belong to you.');
    if (rec.order_status !== 'pending' || rec.payment_status !== 'created') {
        throw httpError(409, 'This order has already been processed.');
    }

    // --- Ask the gateway to charge the card ---
    const result = gateway.charge({ providerOrderId, amount: rec.amount, method, simulateFailure });
    if (result.status !== 'paid') {
        await db.query("UPDATE payments SET status = 'failed', method = $2 WHERE id = $1", [rec.payment_id, method]);
        throw httpError(402, result.reason || 'Payment failed.');
    }

    // --- Verify the signature exactly like a real integration would ---
    if (!gateway.verifySignature(providerOrderId, result.providerPaymentId, result.signature)) {
        await db.query("UPDATE payments SET status = 'failed' WHERE id = $1", [rec.payment_id]);
        throw httpError(400, 'Payment signature verification failed.');
    }

    // --- Fulfil ---
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Re-check + decrement stock atomically. The WHERE guard prevents
        // overselling if two orders race for the last items.
        const { rows: lines } = await client.query(
            'SELECT menu_item_id, quantity FROM order_items WHERE order_id = $1',
            [rec.order_id]
        );
        for (const line of lines) {
            const upd = await client.query(
                `UPDATE menu_items
                 SET stock_quantity = stock_quantity - $1
                 WHERE id = $2 AND stock_quantity >= $1
                 RETURNING id`,
                [line.quantity, line.menu_item_id]
            );
            if (upd.rows.length === 0) {
                throw httpError(409, 'An item just went out of stock. Payment not completed.');
            }
        }

        // Assign a per-day pickup token.
        const tokenRes = await client.query(
            `SELECT COALESCE(MAX(token_number), 0) + 1 AS next
             FROM orders
             WHERE token_number IS NOT NULL AND created_at::date = CURRENT_DATE`
        );
        const tokenNumber = tokenRes.rows[0].next;

        await client.query(
            "UPDATE orders SET status = 'paid', token_number = $2 WHERE id = $1",
            [rec.order_id, tokenNumber]
        );
        await client.query(
            "UPDATE payments SET status = 'paid', provider_payment_id = $2, method = $3 WHERE id = $1",
            [rec.payment_id, result.providerPaymentId, method]
        );

        await client.query('COMMIT');

        return {
            success: true,
            orderId: rec.order_id,
            tokenNumber,
            amount: rec.amount,
            paymentId: result.providerPaymentId,
            status: 'paid',
        };
    } catch (err) {
        await client.query('ROLLBACK');
        // Mark the payment failed so the pending order can't be silently stuck "paid".
        await db.query("UPDATE payments SET status = 'failed' WHERE id = $1", [rec.payment_id]).catch(() => {});
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { payAndFulfill };
