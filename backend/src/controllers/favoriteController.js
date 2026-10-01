const db = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

// Returns the user's favorite menu items (full rows, so the UI can render them).
const list = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        `SELECT mi.*
         FROM favorites f JOIN menu_items mi ON mi.id = f.menu_item_id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC`,
        [req.user.userId]
    );
    res.json(rows);
});

const add = asyncHandler(async (req, res) => {
    await db.query(
        `INSERT INTO favorites (user_id, menu_item_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [req.user.userId, req.params.menuItemId]
    );
    res.status(201).json({ success: true });
});

const remove = asyncHandler(async (req, res) => {
    await db.query('DELETE FROM favorites WHERE user_id = $1 AND menu_item_id = $2', [
        req.user.userId,
        req.params.menuItemId,
    ]);
    res.json({ success: true });
});

module.exports = { list, add, remove };
