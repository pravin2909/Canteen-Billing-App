const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- General API Routes ---
app.get('/', (req, res) => res.send('Canteen Wala Backend is running!'));

// Fetches all menu items for display
app.get('/api/menu', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM menu_items ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching menu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- User Authentication Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, passwordHash]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error('Registration error:', err);
        if (err.code === '23505') {
            return res.status(400).json({ error: "Email already in use." });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const token = jwt.sign(
            { userId: user.id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Protected Routes (Require a valid token) ---
// Note: `authMiddleware` acts as a guard on all routes below this point.

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { rows } = await db.query(
            "SELECT id, name, email, created_at FROM users WHERE id = $1",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handles placing a new order
app.post('/api/orders', authMiddleware, async (req, res) => {
    const { cart, total } = req.body;
    const userId = req.user.userId;
    const client = await db.getClient(); // Important for transactions

    try {
        await client.query('BEGIN'); // Start transaction

        // Step 1: Create an order record
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id',
            [userId, total]
        );
        const orderId = orderResult.rows[0].id;

        // Step 2: Insert each cart item into order_items and update stock
        for (const item of cart) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.id, item.quantity, item.price]
            );
            await client.query(
                'UPDATE menu_items SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [item.quantity, item.id]
            );
        }

        await client.query('COMMIT'); // Finalize transaction
        res.status(201).json({ success: true, orderId });

    } catch (err) {
        await client.query('ROLLBACK'); // Undo all changes if an error occurs
        console.error('Order placement error:', err);
        res.status(500).json({ error: 'Failed to place order.' });
    } finally {
        client.release(); // Release the client back to the pool
    }
});

// Fetches the detailed order history for the logged-in user
app.get('/api/orders/history', authMiddleware, async (req, res) => {
    const userId = req.user.userId;
    try {
        const query = `
            SELECT 
                o.id as order_id,
                o.total_amount,
                o.created_at,
                json_agg(
                    json_build_object(
                        'name', mi.name,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )
                ) as items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Fetch order history error:', err);
        res.status(500).json({ error: 'Failed to fetch order history.' });
    }
});
let userCarts = {}; // In-memory storage (use Redis in production)

app.post('/api/cart', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    userCarts[userId] = req.body.cart;
    res.json({ success: true });
});

app.delete('/api/cart', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    delete userCarts[userId];
    res.json({ success: true });
});

// Updated order placement with stock validation
app.post('/api/orders', authMiddleware, async (req, res) => {
    const { cart, total } = req.body;
    const userId = req.user.userId;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Validate stock before processing
        for (const item of cart) {
            const { rows } = await client.query(
                'SELECT stock_quantity FROM menu_items WHERE id = $1',
                [item.id]
            );
            
            if (rows.length === 0 || rows[0].stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}`);
            }
        }

        // ... rest of order processing ...
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Order error:', err);
        res.status(400).json({ error: err.message || 'Failed to place order' });
    } finally {
        client.release();
    }
});
// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});