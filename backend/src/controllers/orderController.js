const db = require('../config/db');
const orderService = require('../services/orderService');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

// Create a pending order from the cart and get a (mock) payment handle back.
const create = asyncHandler(async (req, res) => {
    const result = await orderService.createPendingOrder(req.user.userId, req.body.items);
    res.status(201).json(result);
});

// Logged-in user's order history with line items.
const history = asyncHandler(async (req, res) => {
    const query = `
        SELECT o.id AS order_id, o.total_amount, o.status, o.token_number, o.created_at,
               json_agg(json_build_object(
                   'name', mi.name, 'quantity', oi.quantity, 'price', oi.price
               ) ORDER BY mi.name) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC;`;
    const { rows } = await db.query(query, [req.user.userId]);
    res.json(rows);
});

const getOne = asyncHandler(async (req, res) => {
    const query = `
        SELECT o.id AS order_id, o.total_amount, o.status, o.token_number, o.created_at,
               json_agg(json_build_object(
                   'name', mi.name, 'quantity', oi.quantity, 'price', oi.price
               ) ORDER BY mi.name) AS items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.id = $1 AND o.user_id = $2
        GROUP BY o.id;`;
    const { rows } = await db.query(query, [req.params.id, req.user.userId]);
    if (rows.length === 0) throw httpError(404, 'Order not found.');
    res.json(rows[0]);
});

module.exports = { create, history, getOne };
