# Sticker Shop

A single-runtime Angular + Express project for a sticker shop. The backend is file-based only (JSON stores in `backend/src/data`), with no demo/production split or Printify integration.

## Tech Stack
- Frontend: Angular 20 (standalone components, zoneless)
- Backend: Node.js + Express (CommonJS)
- Storage: JSON files (`users.json`, `products.json`, `orders.json`, `carts.json`)

## Getting Started
1) Backend
- `cd backend`
- `cp .env.example .env` and set `JWT_SECRET` (already populated locally)
- `npm install`
- Seed local data (demo user/admin + products): `node src/seeds/seed-all.js`
- Start API: `npm start` (listens on port 3000)

2) Frontend
- `cd frontend`
- `npm install`
- `npm start` (dev server on port 5000; targets `http://localhost:3000`)

## API Overview
- `GET /api/health` – service check
- `POST /api/auth/login` / `POST /api/auth/register` / `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:id`, `GET /api/products/catalog`
- `POST /api/products`, `PUT /api/products/:id`, `PATCH /api/products/:id/stock|badge`, `DELETE /api/products/:id` (admin only via `/api/admin`)
- `GET/POST /api/cart` operations
- `GET/POST /api/orders` (admin can list/manage; users see their own)
- `POST /api/checkout/create-payment-intent`
- Admin router mounted at `/api/admin` (all routes require admin role)

## Demo Accounts (seeded)
- User: `demo@nightreader.com` / `demo123`
- Admin: `admin@nightreader.com` / `admin123`

Run `node backend/src/seeds/seed-all.js` anytime to repopulate empty data files.
