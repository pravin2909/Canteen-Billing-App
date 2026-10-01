# Hotel Management System

A hotel ordering & billing app: browse a menu, add to cart, pay through a
(dummy) payment gateway, get a pickup token, and track your order. Includes an admin
panel for managing the menu and orders.

**Stack:** Next.js 15 / React 19 (frontend) · Express 5 + PostgreSQL (backend) · JWT auth.

---

## Architecture

```
hotel-management-system/
├── app/                      # Next.js frontend (App Router)
│   ├── page.js               # Customer app (auth, menu, cart, checkout, history)
│   └── admin/page.js         # Admin panel (menu CRUD + order management)
├── lib/api.js                # API base URL + fetch wrapper (uses NEXT_PUBLIC_API_URL)
│
└── backend/                  # Express API
    ├── index.js              # Entry point (starts the server)
    ├── db/
    │   ├── schema.sql        # Tables: users, menu_items, orders, order_items, payments, favorites
    │   ├── migrate.js        # Applies schema.sql  (npm run migrate)
    │   └── seed.js           # Seeds menu + admin user  (npm run seed)
    └── src/
        ├── app.js            # Express app: middleware + route mounting
        ├── config/db.js      # PostgreSQL pool
        ├── middleware/       # auth (JWT), adminOnly, error handler
        ├── routes/           # auth, menu, orders, payments, favorites, admin
        ├── controllers/      # request handlers (thin)
        └── services/         # business logic: orders, payments, mock gateway
```

### Key design points
- **Prices & totals are computed on the server** from the database — the client only sends
  item ids and quantities. (The old version trusted the client's price/total, which is unsafe
  for a billing app.)
- **Stock is only decremented after a successful payment**, inside a transaction with a
  `stock_quantity >= qty` guard so items can't be oversold.
- **Payments** go through a swappable mock gateway (`src/services/mockGateway.js`) that mimics
  a real provider's create → charge → verify-signature flow.
---

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (create an empty database, e.g. `canteen`)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit .env with your DB credentials + a JWT secret
npm run migrate             # create the tables
npm run seed                # add sample menu + admin user
npm run dev                 # starts on http://localhost:5000
```

**Seeded admin login:** `admin@canteen.com` / `admin123`

### 2. Frontend
```bash
cd ..                       # back to the project root
npm install
# optional: cp .env.local.example .env.local  (only if backend isn't on :5000)
npm run dev                 # starts on http://localhost:3000
```

Open http://localhost:3000, register a customer account (or log in as the admin and visit
**Admin Panel** from the user menu → or go to `/admin`).

---

## Payment flow 

1. `POST /api/orders` → server validates stock, computes the total from DB prices, creates a
   **pending** order, and returns a `providerOrderId`.
2. `POST /api/payments/verify` `{ providerOrderId, method, simulateFailure }` → the mock gateway
   "charges", the server verifies the signature, decrements stock, marks the order **paid**, and
   assigns a daily **pickup token**.

---

## API reference (summary)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/register` | — | Register (auto-login, returns token) |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/profile` | user | Current user |
| GET | `/api/menu` | — | List available items |
| POST | `/api/orders` | user | Create pending order |
| GET | `/api/orders/history` | user | Order history |
| POST | `/api/payments/verify` | user | Pay + fulfil order |
| GET/POST/DELETE | `/api/favorites[/:id]` | user | Manage favorites |
| POST/PUT/DELETE | `/api/admin/menu[/:id]` | admin | Menu CRUD |
| GET | `/api/admin/orders` | admin | All orders |
| PATCH | `/api/admin/orders/:id/status` | admin | Update order status |

---

## Roadmap

- [ ] Ratings & reviews, prepaid wallet / balance, email receipts
- [ ] Real Razorpay test-mode integration
- [ ] Automated tests (Jest + Supertest for the API)
- [ ] ML features — recommendations, demand forecasting, prep-time estimates (see below)

---

## Ideas for making it a standout project

Concrete directions, roughly easy → ambitious. Each uses data the schema already has
(`users`, `menu_items`, `orders`, `order_items`, `payments`, `favorites`), so you can
start without new infrastructure.

### 1. "You might also like" recommendations (best first ML feature)
- **What:** Suggest items a user is likely to want on the menu / cart page.
- **How:** *Market-basket analysis* (Apriori / FP-Growth) on `order_items`, or
  *item-based collaborative filtering* using `favorites` + order history (cosine similarity).
- **Why:** Visible in the UI, explainable, and reuses data you already collect.

### 2. Demand forecasting for the kitchen
- **What:** Predict how many of each item will sell tomorrow / next hour.
- **How:** Time-series (Prophet, SARIMA) or a gradient-boosted regressor (XGBoost/LightGBM)
  on `orders.created_at` + `order_items.quantity`. Surface as a chart in the admin panel.

### 3. Smart prep-time / wait-time estimate
- **What:** Show a realistic "ready in ~X min" when an order is paid.
- **How:** Regression on historical status-transition timestamps vs. current queue length
  and item mix.

### 4. Dynamic pricing / combo suggestions
- **What:** Discount slow-moving stock; auto-propose combos. Rule-based first, uplift model later.

### 5. Food image classification (deep-learning showcase)
- **What:** Admin uploads a dish photo; a CNN auto-tags category / name.
- **How:** Transfer learning (ResNet/MobileNet) or a hosted vision API.

### 6. Churn / re-engagement prediction
- **What:** Flag customers who stopped ordering.
- **How:** Logistic regression / random forest on RFM features derived from `orders`.

### Suggested architecture for the ML parts
Keep ML out of the Express app. Run a small **Python ML service** (FastAPI) that reads the
same PostgreSQL DB, trains offline (cron/notebook), and serves predictions over a tiny REST
API. Express calls it for recommendations/forecasts and caches results. Clean, and a
realistic microservice pattern to show off.

### Non-ML polish that makes a big difference
- **Tests** (Jest + Supertest) — signals maturity more than any single feature.
- **Real-time order board** (WebSockets/SSE) for the kitchen.
- **Dockerize** (compose: frontend + backend + Postgres + ML service) for one-command setup.
- **Admin analytics dashboard** (revenue, top items, peak hours) — a home for the forecasts.
- **CI** (GitHub Actions: lint + test on push).
