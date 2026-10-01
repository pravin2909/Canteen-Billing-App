const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { asyncHandler, httpError } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
    return jwt.sign(
        { userId: user.id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw httpError(400, 'Name, email and password are required.');
    if (!EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address.');
    if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters.');

    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const { rows } = await db.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3) RETURNING id, name, email, role`,
            [name, email.toLowerCase(), passwordHash]
        );
        const user = rows[0];
        // Auto-login on register for a smoother flow.
        res.status(201).json({ token: signToken(user), user });
    } catch (err) {
        if (err.code === '23505') throw httpError(409, 'Email already in use.');
        throw err;
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw httpError(400, 'Email and password are required.');

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (rows.length === 0) throw httpError(401, 'Invalid credentials.');

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw httpError(401, 'Invalid credentials.');

    res.json({
        token: signToken(user),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});

const profile = asyncHandler(async (req, res) => {
    const { rows } = await db.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [req.user.userId]
    );
    if (rows.length === 0) throw httpError(404, 'User not found.');
    res.json(rows[0]);
});

module.exports = { register, login, profile };
