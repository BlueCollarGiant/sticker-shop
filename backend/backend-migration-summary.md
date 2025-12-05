# Backend JS Migration Summary

- Converted entire backend to CommonJS JavaScript and removed all TypeScript artifacts (files, types, tsconfig).
- Removed demo/postgres/prisma branches; API now uses file-based JSON repositories only.
- Added JSON data stores (`users.json`, `products.json`, `orders.json`, `carts.json`) and synchronous read/write repositories.
- Updated environment loader, routers, middleware, validators, seeds, and entrypoints to `.js` with `.js` suffixed internal requires.
- Simplified scripts in `package.json` to `start`/`dev` targeting `src/server.js`; pruned TS deps.

## Current backend/src tree
```
src
├─ app.js
├─ server.js
├─ config
│  └─ env.js
├─ domain
│  ├─ auth
│  │  ├─ auth.controller.js
│  │  ├─ auth.router.js
│  │  └─ auth.service.js
│  ├─ cart
│  │  ├─ cart.constants.js
│  │  ├─ cart.controller.js
│  │  ├─ cart.router.js
│  │  └─ cart.service.js
│  ├─ checkout
│  │  ├─ checkout.controller.js
│  │  └─ checkout.router.js
│  ├─ orders
│  │  ├─ order.controller.js
│  │  ├─ order.router.js
│  │  └─ order.service.js
│  └─ products
│     ├─ product.controller.js
│     ├─ product.router.js
│     └─ product.service.js
├─ infra
│  └─ file
│     ├─ file-auth.repository.js
│     ├─ file-cart.repository.js
│     ├─ file-order.repository.js
│     └─ file-product.repository.js
├─ middleware
│  ├─ auth.middleware.js
│  ├─ error-handler.js
│  ├─ not-found.js
│  └─ validate.js
├─ seeds
│  ├─ seed-all.js
│  └─ seed-products.js
└─ validators
   ├─ auth.validator.js
   ├─ cart.validator.js
   └─ product.validator.js
```
