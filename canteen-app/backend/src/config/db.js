const { Pool } = require('pg');
require('dotenv').config();

// Single shared connection pool for the whole app.
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('error', (err) => {
    console.error('Unexpected idle client error', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(), // use for multi-statement transactions
    pool,
};
