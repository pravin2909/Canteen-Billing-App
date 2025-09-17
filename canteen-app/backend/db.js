const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export the pool so other files can use it to run queries
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(), // <-- ADD THIS LINE
};