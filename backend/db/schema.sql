-- Canteen Billing App — database schema
-- Run with: npm run migrate

-- Users -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Menu items --------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(150)  NOT NULL,
    description    TEXT          NOT NULL DEFAULT '',
    price          INTEGER       NOT NULL CHECK (price >= 0),   -- whole rupees
    category       VARCHAR(60)   NOT NULL DEFAULT 'Uncategorized',
    image_path     VARCHAR(255),
    stock_quantity INTEGER       NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Orders ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount  INTEGER      NOT NULL CHECK (total_amount >= 0), -- authoritative, server-computed
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- status: pending -> paid -> preparing -> ready -> completed | cancelled
    token_number  INTEGER,     -- pickup token, assigned once paid
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Order line items --------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id           SERIAL PRIMARY KEY,
    order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
    quantity     INTEGER NOT NULL CHECK (quantity > 0),
    price        INTEGER NOT NULL CHECK (price >= 0)  -- unit price captured at order time
);

-- Payments (mock gateway) ------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id                 SERIAL PRIMARY KEY,
    order_id           INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider           VARCHAR(40)  NOT NULL DEFAULT 'mock',
    provider_order_id  VARCHAR(80)  NOT NULL,          -- e.g. order_mock_xxx
    provider_payment_id VARCHAR(80),                   -- e.g. pay_mock_xxx
    method             VARCHAR(20),                    -- 'card' | 'upi' | 'netbanking'
    amount             INTEGER      NOT NULL CHECK (amount >= 0),
    status             VARCHAR(20)  NOT NULL DEFAULT 'created', -- created | paid | failed
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Favorites (persisted per user) -----------------------------------
CREATE TABLE IF NOT EXISTS favorites (
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, menu_item_id)
);

-- Helpful indexes ---------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_user      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order   ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id);
