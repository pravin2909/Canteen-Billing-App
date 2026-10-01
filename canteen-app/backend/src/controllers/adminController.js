const db = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

const ORDER_STATUSES = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];

// --- Menu management ---
const createMenuItem = asyncHandler(async (req, res) => {
    const { name, description = '', price, category = 'Uncategorized', image_path = null, stock_quantity = 0 } = req.body;
    if (!name || price == null) throw httpError(400, 'Name and price are required.');
    const { rows } = await db.query(
        `INSERT INTO menu_items (name, description, price, category, image_path, stock_quantity)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [name, description, price, category, image_path, stock_quantity]
    );
    res.status(201).json(rows[0]);
});

const updateMenuItem = asyncHandler(async (req, res) => {
    const fields = ['name', 'description', 'price', 'category', 'image_path', 'stock_quantity', 'is_available'];
    const sets = [];
    const values = [];
    for (const f of fields) {
        if (req.body[f] !== undefined) {
            values.push(req.body[f]);
            sets.push(`${f} = $${values.length}`);
        }
    }
    if (sets.length === 0) throw httpError(400, 'No fields to update.');
    values.push(req.params.id);
    const { rows } = await db.query(
        `UPDATE menu_items SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    if (rows.length === 0) throw httpError(404, 'Menu item not found.');
    res.json(rows[0]);
});

const deleteMenuItem = asyncHandler(async (req, res) => {
    const { rowCount } = await db.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    if (rowCount === 0) throw httpError(404, 'Menu item not found.');
    res.json({ success: true });
});

// --- Order management ---
const listOrders = asyncHandler(async (req, res) => {
    const query = `
        SELECT o.id AS order_id, o.total_amount, o.status, o.token_number, o.created_at,
               u.name AS customer_name, u.email AS customer_email,
               json_agg(json_build_object(
                   'name', mi.name, 'quantity', oi.quantity, 'price', oi.price
               ) ORDER BY mi.name) AS items
        FROM orders o
        JOIN users u ON u.id = o.user_id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        GROUP BY o.id, u.name, u.email
        ORDER BY o.created_at DESC;`;
    const { rows } = await db.query(query);
    res.json(rows);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) throw httpError(400, 'Invalid status.');
    const { rows } = await db.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
        [status, req.params.id]
    );
    if (rows.length === 0) throw httpError(404, 'Order not found.');
    res.json(rows[0]);
});

module.exports = { createMenuItem, updateMenuItem, deleteMenuItem, listOrders, updateOrderStatus };
