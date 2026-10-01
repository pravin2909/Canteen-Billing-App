const db = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

// Public: list available menu items.
const list = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        'SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, id ASC'
    );
    res.json(rows);
});

const getOne = asyncHandler(async (req, res) => {
    const { rows } = await db.query('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);
    if (rows.length === 0) throw httpError(404, 'Menu item not found.');
    res.json(rows[0]);
});

module.exports = { list, getOne };
