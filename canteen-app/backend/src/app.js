const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Basic rate limiting (protects auth + the whole API from abuse).
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 200 }));

// --- Health check ---
app.get('/', (_req, res) => res.send('Canteen Wala Backend is running!'));

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- 404 + error handling ---
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(errorHandler);

module.exports = app;
