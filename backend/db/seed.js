// Seeds menu items and a default admin user.
// Usage: npm run seed   (safe to run multiple times — uses ON CONFLICT / guards)
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

const menu = [
    // name, description, price (₹), category, image_path, stock
    ['Samosa', 'Crispy golden pastry stuffed with spiced potato and peas.', 25, 'Starters', '/images/samosa.jpg', 100],
    ['Chicken 65', 'Fiery South-Indian fried chicken tossed with curry leaves.', 180, 'Starters', '/images/chicken65.jpg', 40],
    ['Idli with Vada', 'Soft steamed idlis and a crisp medu vada with chutney & sambar.', 60, 'Breakfast & Tiffins', '/images/idliwithvada.jpg', 60],
    ['Ghee Roast Dosa', 'Crispy dosa roasted in pure ghee, served with chutney & sambar.', 90, 'Breakfast & Tiffins', '/images/gheeroastdosa.jpg', 50],
    ['Special Chicken Biryani', 'Fragrant basmati rice layered with tender spiced chicken.', 220, 'Main Course', '/images/specialchickenbiryani.jpg', 30],
    ['Mutton Rogan Josh', 'Slow-cooked mutton in a rich aromatic Kashmiri gravy.', 280, 'Main Course', '/images/muttonroganjosh.jpg', 20],
    ['Paneer Tikka Masala', 'Grilled paneer simmered in a creamy tomato-butter gravy.', 200, 'Main Course', '/images/paneertikkamasala.jpg', 35],
    ['Butter Naan', 'Soft tandoor-baked flatbread brushed with butter.', 40, 'Breads', '/images/menu.jpg', 80],
    ['Tandoori Roti', 'Whole-wheat flatbread fresh from the tandoor.', 25, 'Breads', '/images/menu.jpg', 80],
];

(async () => {
    try {
        // --- Menu items (skip if an item with the same name already exists) ---
        for (const [name, description, price, category, image_path, stock] of menu) {
            const existing = await db.query('SELECT id FROM menu_items WHERE name = $1', [name]);
            if (existing.rows.length === 0) {
                await db.query(
                    `INSERT INTO menu_items (name, description, price, category, image_path, stock_quantity)
                     VALUES ($1,$2,$3,$4,$5,$6)`,
                    [name, description, price, category, image_path, stock]
                );
            }
        }
        console.log(`✅ Seeded ${menu.length} menu items.`);

        // --- Default admin user ---
        const adminEmail = 'admin@canteen.com';
        const adminExists = await db.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        if (adminExists.rows.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await db.query(
                `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin')`,
                ['Canteen Admin', adminEmail, hash]
            );
            console.log('✅ Created admin user  ->  admin@canteen.com / admin123');
        } else {
            console.log('ℹ️  Admin user already exists, skipped.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
})();
