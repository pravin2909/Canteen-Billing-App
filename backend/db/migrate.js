// Applies db/schema.sql to the configured database.
// Usage: npm run migrate
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

(async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await db.query(sql);
        console.log('✅ Schema applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
})();
