# 🔬 STICKER-SHOP CODEBASE FORENSIC ANALYSIS
**Complete Technical Debt & Architecture Audit**

Generated: 2025-12-04
Project: Night Reader Sticker Shop (Full-Stack TypeScript/Angular/Node)

---

## 🔍 SECTION 1: OBSOLETE SYSTEM ASSUMPTIONS

### 1.1 DEMO_MODE Architecture (CRITICAL - Breaks Production Path)

**Status**: System currently **LOCKED** in demo mode; production path is unreachable

| File | Line | Issue | Recommended Action |
|------|------|-------|-------------------|
| `backend/src/config/env.ts` | 14 | `DEMO_MODE: z.string().default('true')` - hardcoded to demo | Replace with environment-based strategy pattern |
| `backend/src/app.ts` | 35 | Health check exposes `DEMO` vs `PRODUCTION` toggle | Remove; use feature flags or repository pattern |
| `backend/src/app.ts` | 52-54 | `if (env.DEMO_MODE)` gates admin routes with `require()` (mixing CJS/ESM) | Delete; migrate to TypeScript router factory |
| `backend/src/server.ts` | 3-4 | Imports DemoProductStore, DemoAuthStore globally | Move to dependency injection container |
| `backend/src/server.ts` | 9-23 | Auto-seed logic coupled to demo mode | Extract to seeding service with CLI interface |
| `backend/src/server.ts` | 31 | Console log shows `DEMO` vs `PRODUCTION` | Remove environment exposure |

**Root Cause**: The system was built with a **temporary demo mode flag** that became permanent infrastructure. There's no graceful migration path to production because:
- Demo stores are the ONLY working repositories
- PostgreSQL repositories throw errors immediately
- No repository switching strategy exists

**Impact**: **PRODUCTION DEPLOYMENT IS IMPOSSIBLE** without major refactoring.

---

### 1.2 Frontend Demo Mode References

| File | Line | Issue | Recommended Action |
|------|------|-------|-------------------|
| `frontend/src/app/app.routes.ts` | 7 | `import { LoginComponent as DemoLoginComponent }` - naming confusion | Rename to `SimpleLoginComponent` or delete if duplicate |
| `frontend/src/app/app.routes.ts` | 24-25 | Route comment: "Demo mode login (simple demo login)" | Remove comment; unify login flows |
| `frontend/src/app/components/auth/login/login.ts` | 46-56 | `onDemoLoginUser()`, `onDemoLoginAdmin()` - hardcoded demo credentials | Replace with environment-based test account seeding |
| `frontend/src/app/components/auth/login/login.html` | 61-86 | Demo login buttons in production UI | Move to dev-only feature flag or admin panel |

**Root Cause**: Dual login systems exist (simple demo vs full account). The "demo" login is actually the ONLY working auth flow, but it's named misleadingly.

**Recommended Renaming**:
- `DemoLoginComponent` → `LoginComponent` (it's the real one)
- `LoginComponent` (account/login) → `FullAccountLoginComponent` (if keeping) or DELETE
- `onDemoLoginUser()` → `loginAsTestUser()` (dev-only)

---

### 1.3 Postgres/Prisma Dead Infrastructure

| File | Line | Issue | Impact |
|------|------|-------|--------|
| `backend/src/infra/postgres/prisma-client.ts` | 7 | `export const prisma = undefined as never;` | Prisma client stubbed out entirely |
| `backend/src/infra/postgres/prisma-client.ts` | 10 | `connectDatabase()` prints warning, does nothing | Database connection never happens |
| `backend/src/infra/postgres/postgres-product.repository.ts` | 15 | All methods throw "disabled; use DemoProductStore" | Dead code masquerading as interface compliance |
| `backend/src/infra/postgres/postgres-auth.repository.ts` | 8 | Same pattern; all methods throw errors | Dead code |
| `backend/prisma/schema.prisma` | 1-66 | Complete Prisma schema exists but is NEVER used | Orphaned infrastructure |

**Root Cause**: Postgres/Prisma was scaffolded but NEVER activated. The entire `infra/postgres` folder is **vestigial architecture**.

**Recommendation**: Either:
1. **DELETE** all Postgres code if staying file-based (demo stores)
2. **IMPLEMENT** Postgres repos and create migration strategy
3. **Document** that Postgres is future work (not "disabled")

---

## 🔍 SECTION 2: UNUSED OR DEAD FILES

### 2.1 Backend Dead Code

| File | Status | Reason | Action |
|------|--------|--------|--------|
| `backend/routes/demo/admin.js` | ⚠️ **LEGACY** | JavaScript file in TypeScript project; uses `require()` | Migrate to TypeScript or DELETE if covered by domain routers |
| `backend/routes/orders.js` | ⚠️ **LEGACY** | JavaScript file with in-memory orders (orphaned) | DELETE; replaced by domain/orders router |
| `backend/middleware/role.middleware.js` | ⚠️ **MIXED** | JavaScript file; used by `admin.js` which is legacy | Migrate to TS or delete with admin.js |
| `backend/src/infra/postgres/postgres-auth.repository.ts` | ❌ **DEAD** | All methods throw errors | DELETE or implement |
| `backend/src/infra/postgres/postgres-product.repository.ts` | ❌ **DEAD** | All methods throw errors | DELETE or implement |
| `backend/src/infra/postgres/prisma-client.ts` | ❌ **STUB** | No actual client; just warnings | DELETE or implement |

**Critical Finding**: The `backend/routes/` folder contains **orphaned JavaScript routers** that conflict with the new domain-driven TypeScript routers in `backend/src/domain/`.

**Evidence**:
- `backend/src/app.ts:53` requires `../routes/demo/admin` (JS) conditionally
- But `backend/src/domain/products/product.router.ts` has a TypeScript admin pattern
- The two systems coexist but serve different endpoints

**Recommendation**: DELETE `backend/routes/` entirely; migrate any missing logic to TypeScript domain routers.

---

### 2.2 Frontend Legacy Services vs New Stores

| File | Status | Used By | Action |
|------|--------|---------|--------|
| `frontend/src/app/services/products.ts` | ⚠️ **ORPHANED** | ZERO imports found | DELETE; replaced by `features/products/product.api.ts` |
| `frontend/src/app/services/admin.service.ts` | ✅ **ACTIVE** | Used by 4 admin components | KEEP; has hardcoded localhost URL (fix below) |
| `frontend/src/app/services/shop/mock-products.ts` | ✅ **ACTIVE** | Used by products.ts, admin components | KEEP; imports legacy models (fix below) |
| `frontend/src/app/models/product.model.ts` | ⚠️ **LEGACY** | Used by 8 files | MERGE with `features/products/product.types.ts` |
| `frontend/src/app/models/user.model.ts` | ✅ **ACTIVE** | Used by 2 files | KEEP; but rename to `user.types.ts` for consistency |

**Root Cause**: Mid-migration from **services-based architecture** to **feature-based stores**. The new architecture lives in `features/`, but old code in `services/` and `models/` still exists.

**Recommended Migration**:
1. DELETE `services/products.ts` (no consumers)
2. MOVE `services/admin.service.ts` → `features/admin/admin.api.ts`
3. MERGE `models/product.model.ts` into `features/products/product.types.ts`
4. RENAME `models/user.model.ts` → `features/auth/user.types.ts`
5. DELETE empty `models/` and `services/` folders

---

### 2.3 Frontend Duplicate Login Components

| File | Purpose | Status |
|------|---------|--------|
| `frontend/src/app/components/auth/login/login.ts` | Simple demo login with hardcoded creds | ✅ **PRIMARY** (works) |
| `frontend/src/app/components/account/login/login.ts` | Full account login (unused?) | ⚠️ **SECONDARY** (check usage) |
| `frontend/src/app/components/account/signup/signup.ts` | Full signup flow | ⚠️ **UNUSED?** |

**Issue**: Two login components with identical names but different imports:
```typescript
// In app.routes.ts:
import { LoginComponent as DemoLoginComponent } from './components/auth/login/login';
import { LoginComponent } from './components/account/login/login';
```

**Recommendation**: Unify into ONE login component, or clearly namespace:
- `components/auth/` → quick login (keep)
- `components/account/` → DELETE if unused, or rename to `RegisteredAccountLogin`

---

## 🔍 SECTION 3: UNUSED IMPORTS

### 3.1 Frontend ProductsService - ZERO CONSUMERS

**File**: `frontend/src/app/services/products.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../core/config/api.config';
```

**Finding**: Grep search for `import.*from.*services/products` returned **zero results**.

**Conclusion**: This service is **completely orphaned**. All product API calls now go through `features/products/product.api.ts`.

**Action**: DELETE `services/products.ts` immediately.

---

### 3.2 Legacy Model Imports Still Used

**File**: `frontend/src/app/models/product.model.ts`

**Consumers**: 8 files (admin components, mock-products.ts, etc.)

**Problem**: This file duplicates types from `features/products/product.types.ts`, causing **type drift**.

**Differences Found**:

| Type | models/product.model.ts | features/products/product.types.ts | Conflict |
|------|-------------------------|-----------------------------------|----------|
| `ProductBadge.LIMITED` | `'limited'` | `'limited-edition'` | ❌ **MISMATCH** |
| `Product.images` | `ProductImage[] \| string[]` | `ProductImage[]` | ❌ **LOOSER TYPE** |
| `Product.badges` | `ProductBadge[] \| string[]` | `ProductBadge[]` | ❌ **LOOSER TYPE** |

**Root Cause**: The old model allows string arrays, the new one enforces typed arrays. This creates **runtime type errors**.

**Action**: MERGE both files into `features/products/product.types.ts` as single source of truth.

---

## 🔍 SECTION 4: DUPLICATE DATA MODELS

### 4.1 Product Type Definitions (3 SOURCES!)

| Source | File | ProductBadge.LIMITED |
|--------|------|---------------------|
| **Frontend Legacy** | `frontend/src/app/models/product.model.ts:59` | `'limited'` |
| **Frontend New** | `frontend/src/app/features/products/product.types.ts:10` | `'limited-edition'` |
| **Backend** | `backend/src/domain/products/product.types.ts:39` | `'limited'` |

**CRITICAL BUG**: Frontend new types use `'limited-edition'`, but backend uses `'limited'`. This causes badge mismatch in production.

**Additional Conflicts**:

```typescript
// Frontend legacy allows flexible types:
images: ProductImage[] | string[];
badges?: ProductBadge[] | string[];

// Frontend new enforces strict types:
images: ProductImage[];
badges: ProductBadge[];

// Backend also enforces strict:
images: ProductImage[];
badges: ProductBadge[];
```

**Root Cause**: Mid-migration created THREE competing type definitions.

**Merge Strategy**:
1. DELETE `frontend/src/app/models/product.model.ts`
2. FIX `frontend/src/app/features/products/product.types.ts`:
   - Change `ProductBadge.LIMITED = 'limited-edition'` → `'limited'`
3. Use backend types as source of truth
4. Generate shared types OR create type-checking CI test

---

### 4.2 User Type Definitions (No Conflict)

**Finding**: User types only exist in one place (`frontend/src/app/models/user.model.ts`), so no duplication.

**Recommendation**: Rename to `features/auth/user.types.ts` for consistency with new architecture.

---

## 🔍 SECTION 5: LEGACY ANGULAR CODE

### 5.1 *ngIf / *ngFor Usage (MIXED)

**Total Findings**: 20+ instances of legacy template syntax

**Sample Files**:

| File | Line | Pattern | New Syntax |
|------|------|---------|------------|
| `frontend/src/app/components/products/products.html` | 124 | `*ngIf="isLoading()"` | `@if (isLoading()) { ... }` |
| `frontend/src/app/components/products/products.html` | 139 | `*ngFor="let product of products()"` | `@for (product of products(); track product.id) { ... }` |
| `frontend/src/app/components/cart-summary/cart-summary.html` | 12 | `*ngIf="cartTotals.shipping === 0"` | `@if (cartTotals.shipping === 0) { ... }` |

**Status**: Angular 19/20 supports both syntaxes, but **new control flow is preferred**.

**Recommendation**: Migrate templates to `@if`/`@for` syntax in Angular 20 for:
- Better type checking
- Improved performance
- Future-proof code

**Action**: Do NOT migrate now (not breaking); add to Medium priority cleanup.

---

### 5.2 [(ngModel)] Usage

**Findings**:

| File | Line | Usage | Issue |
|------|------|-------|-------|
| `frontend/src/app/components/account/settings/settings.html` | 318 | `[(ngModel)]="deleteConfirmationText"` | Legacy two-way binding |
| `frontend/src/app/components/account/settings/settings.html` | 331 | `[(ngModel)]="deleteUnderstand"` | Legacy two-way binding |

**Status**: `ngModel` still works in Angular 19, but **signals + reactive forms** are preferred.

**Recommendation**: Low priority; migrate when refactoring settings component.

---

### 5.3 Service-Based State (ELIMINATED ✅)

**Finding**: Grep for `CartService`, `AuthService`, `ProductService` returned **zero results**.

**Conclusion**: The migration to **signal-based stores** is COMPLETE for core features:
- ✅ `features/cart/cart.store.ts`
- ✅ `features/auth/auth.store.ts`
- ✅ `features/products/product.store.ts`
- ✅ `features/orders/order.store.ts`

**Great Work!** No legacy service-based state remains in the main application.

---

## 🔍 SECTION 6: HARDCODED URLs

### 6.1 Localhost URLs (CRITICAL)

| File | Line | Hardcoded URL | Issue |
|------|------|---------------|-------|
| `frontend/src/app/features/products/product.api.ts` | 29 | `'http://localhost:3000/api/products'` | Should use `environment.apiUrl` |
| `frontend/src/app/services/admin.service.ts` | 10 | `'http://localhost:3000/api/demo/admin'` | Should use `environment.apiUrl` |
| `backend/src/config/env.ts` | 17 | `'http://localhost:4200,http://localhost:5000'` | Default CORS; acceptable for dev |
| `backend/src/server.ts` | 32 | `http://localhost:${PORT}/api/health` | Console log only; acceptable |

**Root Cause**: Mid-migration to centralized API config (`frontend/src/app/core/config/api.config.ts`) was incomplete.

**Fix**:
```typescript
// product.api.ts:29
- private readonly apiUrl = 'http://localhost:3000/api/products';
+ private readonly apiUrl = ApiConfig.PRODUCTS.LIST().replace('/products', '');

// admin.service.ts:10
- private readonly API_URL = 'http://localhost:3000/api/demo/admin';
+ private readonly API_URL = ApiConfig.endpoint('demo/admin');
```

**Also Fix**: `frontend/src/app/core/config/api.config.ts:1`
```typescript
// WRONG: Imports development environment in production builds
- import { environment } from '../../../environments/environment.development';
+ import { environment } from '../../../environments/environment';
```

This is a **PRODUCTION BUG** - the API config always uses dev environment!

---

### 6.2 External CDN URLs (Acceptable)

| File | Line | URL | Status |
|------|------|-----|--------|
| `frontend/src/index.html` | 12-14 | Google Fonts CDN | ✅ Acceptable |
| `frontend/src/app/services/shop/mock-products.ts` | Various | `via.placeholder.com`, `placehold.co` | ✅ Demo images; replace for production |

**Recommendation**: Replace placeholder images with real assets before launch.

---

## 🔍 SECTION 7: ARCHITECTURE DRIFT

### 7.1 Mixed JavaScript/TypeScript (CRITICAL)

**Problem**: Backend mixes CommonJS (`.js`) and ESM (`.ts`) modules.

| File | Type | Imported By | Issue |
|------|------|-------------|-------|
| `backend/routes/demo/admin.js` | CommonJS | `app.ts:53` via `require()` | ESM imports CJS dynamically |
| `backend/routes/orders.js` | CommonJS | NONE | Orphaned file |
| `backend/middleware/role.middleware.js` | CommonJS | admin.js | Chained CJS dependency |

**Why This Is Bad**:
1. TypeScript cannot type-check CJS imports
2. `require()` in ESM is a **red flag** for build tools
3. Creates inconsistent module resolution

**Recommendation**: Migrate ALL `.js` files to `.ts` or DELETE if unused.

---

### 7.2 Dual Router Systems

**Backend has TWO routing architectures**:

#### Old System (JavaScript):
```
backend/routes/
├── demo/admin.js      (CJS, requires DemoProductStore)
└── orders.js          (CJS, in-memory orders)
```

#### New System (TypeScript):
```
backend/src/domain/
├── auth/auth.router.ts
├── cart/cart.router.ts
├── checkout/checkout.router.ts
├── orders/order.router.ts
└── products/product.router.ts
```

**Conflict**: `backend/src/app.ts` registers BOTH systems:
- Lines 41-45: New domain routers
- Lines 52-54: Old `require('../routes/demo/admin')`

**Recommendation**: DELETE `backend/routes/` folder entirely. Migrate admin routes to `backend/src/domain/admin/`.

---

### 7.3 Frontend: Dual Model Systems

**Two competing patterns**:

#### Old System:
```
frontend/src/app/
├── models/
│   ├── product.model.ts    (loose types, enums)
│   └── user.model.ts
└── services/
    ├── products.ts         (ORPHANED)
    └── admin.service.ts    (still used)
```

#### New System:
```
frontend/src/app/features/
├── auth/
│   ├── auth.types.ts
│   ├── auth.api.ts
│   └── auth.store.ts
├── products/
│   ├── product.types.ts
│   ├── product.api.ts
│   └── product.store.ts
└── cart/, orders/, etc.
```

**Root Cause**: Mid-migration to **domain-driven feature modules** left old folders intact.

**Recommendation**: Complete the migration:
1. DELETE `services/products.ts`
2. MOVE `services/admin.service.ts` → `features/admin/admin.api.ts`
3. DELETE `models/` folder after merging types into `features/`

---

## 🔍 SECTION 8: BACKEND DEAD CODE SUMMARY

### 8.1 Files to DELETE Immediately

| File | Reason | Consumers |
|------|--------|-----------|
| `backend/routes/orders.js` | Replaced by domain/orders/ | NONE |
| `backend/src/infra/postgres/postgres-auth.repository.ts` | Stub that throws errors | NONE |
| `backend/src/infra/postgres/postgres-product.repository.ts` | Stub that throws errors | NONE |
| `backend/src/infra/postgres/prisma-client.ts` | Stub; no real client | postgres repos |

### 8.2 Files to MIGRATE then DELETE

| File | Action | New Location |
|------|--------|-------------|
| `backend/routes/demo/admin.js` | Rewrite in TypeScript | `domain/admin/admin.router.ts` |
| `backend/middleware/role.middleware.js` | Rewrite in TypeScript | `middleware/role.middleware.ts` |

### 8.3 Demo Stores - Keep or Delete?

**Current Status**: Demo stores are the ONLY working repositories:
- ✅ `infra/demo/demo-auth.store.ts`
- ✅ `infra/demo/demo-cart.store.ts`
- ✅ `infra/demo/demo-order.store.ts`
- ✅ `infra/demo/demo-product.store.ts`

**Recommendation**: KEEP until Postgres repositories are implemented. Then deprecate gracefully.

---

## 🔍 SECTION 9: NAMING INCONSISTENCIES

### 9.1 Singular vs Plural Mismatches

| Location | File Name | Entity Name | Inconsistency |
|----------|-----------|-------------|---------------|
| Frontend | `product.store.ts` | ProductStore | ✅ Singular (correct) |
| Frontend | `product.types.ts` | Product types | ✅ Singular (correct) |
| Frontend | `order.store.ts` | OrderStore | ✅ Singular (correct) |
| Backend | `demo-products.json` | Data file | ⚠️ Plural (file convention OK) |
| Backend | `seed-products.ts` | Seed script | ✅ Plural (correct for collections) |

**Finding**: Naming is mostly consistent! Feature modules use singular names (good).

---

### 9.2 File Extension Inconsistencies

| Pattern | Files | Recommendation |
|---------|-------|----------------|
| `.types.ts` | auth.types.ts, product.types.ts, cart.types.ts | ✅ KEEP (new standard) |
| `.model.ts` | product.model.ts, user.model.ts | ⚠️ LEGACY; rename to `.types.ts` |
| `.store.ts` | All store files | ✅ KEEP (signal stores) |
| `.api.ts` | product.api.ts, auth.api.ts | ✅ KEEP (HTTP layer) |
| `.service.ts` | admin.service.ts, toast.service.ts | ⚠️ MIXED; align naming |

**Recommended Standard**:
- `.types.ts` - Type definitions and interfaces
- `.store.ts` - Signal-based state management
- `.api.ts` - HTTP client wrappers
- `.service.ts` - Business logic services (if not in store)

**Action**: Rename `*.model.ts` → `*.types.ts` for consistency.

---

### 9.3 Component Naming

| Current Name | Location | Issue |
|--------------|----------|-------|
| `LoginComponent` | auth/login/ | ✅ Correct |
| `LoginComponent` | account/login/ | ❌ DUPLICATE NAME |
| `DemoLoginComponent` | app.routes.ts alias | ⚠️ Misleading name |

**Recommendation**:
- Keep `auth/login/` as primary login
- Rename `account/login/` to `RegisteredAccountLogin` OR delete
- Remove "demo" terminology from prod code

---

## 🔍 SECTION 10: PRIORITIZED CLEANUP ROADMAP

---

## 🔥 CRITICAL (Fix Immediately - Breaks Production)

### C1. Environment Configuration Bug
**File**: `frontend/src/app/core/config/api.config.ts:1`
```typescript
// BUG: Always imports dev environment
- import { environment } from '../../../environments/environment.development';
+ import { environment } from '../../../environments/environment';
```
**Impact**: Production builds hit `localhost:3000` instead of prod API.

### C2. ProductBadge Type Mismatch
**Files**:
- `frontend/src/app/features/products/product.types.ts:10`
- `backend/src/domain/products/product.types.ts:39`

```typescript
// Frontend says:
LIMITED = 'limited-edition'

// Backend says:
LIMITED = 'limited'

// FIX: Align both to 'limited'
```
**Impact**: Limited edition badges don't display correctly.

### C3. Hardcoded API URLs
**Files**:
- `frontend/src/app/features/products/product.api.ts:29`
- `frontend/src/app/services/admin.service.ts:10`

**Action**: Replace all hardcoded `http://localhost:3000` with `ApiConfig` calls.

---

## ⚠️ HIGH (Architecture Debt - Plan Migration)

### H1. Delete Postgres Stub Infrastructure
**Files to DELETE**:
- `backend/src/infra/postgres/postgres-auth.repository.ts`
- `backend/src/infra/postgres/postgres-product.repository.ts`
- `backend/src/infra/postgres/prisma-client.ts`

**Reason**: These files pretend to be repositories but throw errors immediately. Either implement Postgres OR delete the stubs.

**Alternative**: If keeping Prisma, IMPLEMENT the repositories properly:
1. Install `@prisma/client` and `prisma`
2. Run `npx prisma generate`
3. Implement repository methods
4. Create migration strategy from demo stores

### H2. Eliminate DEMO_MODE Flag
**Current State**: System locked in demo mode; production unreachable.

**Migration Strategy**:
1. Create **Repository Pattern** with interface:
   ```typescript
   interface IProductRepository { ... }
   class DemoProductRepository implements IProductRepository { ... }
   class PrismaProductRepository implements IProductRepository { ... }
   ```
2. Use **Dependency Injection** to swap implementations:
   ```typescript
   const productRepo = env.USE_POSTGRES
     ? new PrismaProductRepository()
     : new DemoProductRepository();
   ```
3. DELETE `DEMO_MODE` flag entirely
4. DELETE conditional `require()` in app.ts:52-54

**Batches**:
- Batch A: Create interfaces + DI container
- Batch B: Wire up repositories
- Batch C: Remove DEMO_MODE flag
- Batch D: Delete demo-specific code

### H3. Unify Dual Login Systems
**Current State**: Two login components with same name.

**Decision Required**:
- Option A: DELETE `account/login/`, keep `auth/login/` as only login
- Option B: KEEP both, rename `auth/login/` to `QuickLoginComponent`

**Recommendation**: Option A (simpler). Move any missing features from `account/login/` to `auth/login/`.

### H4. Migrate JavaScript Backend Files to TypeScript
**Files**:
- `backend/routes/demo/admin.js` → `backend/src/domain/admin/admin.router.ts`
- `backend/middleware/role.middleware.js` → `backend/src/middleware/role.middleware.ts`
- `backend/routes/orders.js` → DELETE (replaced)

**Reason**: Mixed CJS/ESM breaks type safety and build consistency.

---

## 📊 MEDIUM (Cleanup & Consolidation)

### M1. Merge Duplicate Product Types
**Action**: DELETE `models/product.model.ts`, migrate all imports to `features/products/product.types.ts`.

**Affected Files** (8 total):
- admin-panel.ts
- badge-toggle.ts
- product-editor.ts
- stock-manager.ts
- product-detail.ts
- products.ts
- admin.service.ts
- mock-products.ts

**Script**:
```typescript
// In each file:
- import { Product } from '../../../models/product.model';
+ import { Product } from '../../../features/products/product.types';
```

### M2. DELETE Unused Services
**File**: `frontend/src/app/services/products.ts` - zero consumers.

**Action**: Delete immediately.

### M3. Folder Consolidation
**Backend**: DELETE `backend/routes/` folder after migrating admin routes.

**Frontend**:
1. DELETE `models/` folder after type migration
2. MOVE `services/admin.service.ts` → `features/admin/admin.api.ts`
3. DELETE empty `services/` folder
4. Keep `services/toast.service.ts` (utility, not feature)

### M4. Rename Files for Consistency
| Current | New |
|---------|-----|
| `models/user.model.ts` | `features/auth/user.types.ts` |
| `models/product.model.ts` | DELETE (merged to product.types.ts) |

### M5. Remove "Demo" Naming from Production Code
**Files**:
- app.routes.ts: Remove `DemoLoginComponent` alias
- login.html: Remove "demo login" buttons (move to dev feature flag)
- config/env.ts: Remove `DEMO_MODE` terminology

---

## 🧹 LOW (Polish & Future-Proofing)

### L1. Migrate Angular Templates to New Syntax
**Files**: All `*.html` files with `*ngIf`, `*ngFor`.

**Action**: Migrate to `@if`, `@for` syntax (Angular 19+ control flow).

**Timeline**: Non-breaking; do during routine refactoring.

### L2. Replace Placeholder Images
**File**: `frontend/src/app/services/shop/mock-products.ts`

**Action**: Replace `via.placeholder.com` and `placehold.co` URLs with real product images.

### L3. Migrate ngModel to Reactive Forms
**File**: `frontend/src/app/components/account/settings/settings.html`

**Action**: Replace `[(ngModel)]` with reactive form controls for better type safety.

### L4. Update Comments
**Examples**:
- `app.routes.ts:24`: "Demo mode login" → Remove
- `infra/postgres/prisma-client.ts:3`: "Disabled while demo mode active" → Delete file or update

---

## 📋 COMMIT PLAN (Safe Batches)

### Commit 1: Critical Production Fixes
**Type**: `fix`
**Files**:
- Fix `api.config.ts` environment import
- Fix `ProductBadge.LIMITED` mismatch (frontend + backend)
- Replace hardcoded URLs in `product.api.ts`, `admin.service.ts`

**Commit Message**:
```
fix: resolve production API configuration bugs

- Use correct environment file in ApiConfig
- Align ProductBadge.LIMITED to 'limited' (not 'limited-edition')
- Replace hardcoded localhost URLs with ApiConfig calls

BREAKING: ProductBadge.LIMITED value changed from 'limited-edition' to 'limited'
```

---

### Commit 2: Delete Dead Code
**Type**: `chore`
**Files**:
- DELETE `backend/routes/orders.js`
- DELETE `backend/src/infra/postgres/` (all 3 files)
- DELETE `frontend/src/app/services/products.ts`

**Commit Message**:
```
chore: remove dead code and stub infrastructure

- Delete orphaned orders.js router
- Delete non-functional Postgres repository stubs
- Remove unused ProductsService (replaced by ProductApi)
```

---

### Commit 3: Migrate Backend JS to TS
**Type**: `refactor`
**Files**:
- Rewrite `routes/demo/admin.js` → `src/domain/admin/admin.router.ts`
- Rewrite `middleware/role.middleware.js` → `src/middleware/role.middleware.ts`
- Update `app.ts` to use new TypeScript imports
- DELETE `backend/routes/` folder

**Commit Message**:
```
refactor: migrate backend JavaScript to TypeScript

- Convert admin router to TypeScript domain module
- Convert role middleware to TypeScript
- Remove CJS require() calls from app.ts
- Eliminate mixed module system
```

---

### Commit 4: Consolidate Product Types
**Type**: `refactor`
**Files**:
- DELETE `frontend/src/app/models/product.model.ts`
- Update 8 import statements to use `features/products/product.types.ts`

**Commit Message**:
```
refactor: consolidate duplicate product type definitions

- Merge models/product.model.ts into features/products/product.types.ts
- Update all imports to use single source of truth
- Eliminate type conflicts between legacy and new architecture
```

---

### Commit 5: Folder Cleanup
**Type**: `chore`
**Files**:
- MOVE `services/admin.service.ts` → `features/admin/admin.api.ts`
- RENAME `models/user.model.ts` → `features/auth/user.types.ts`
- DELETE `models/` folder
- DELETE `services/` folder (except toast.service.ts)

**Commit Message**:
```
chore: complete migration to feature-based architecture

- Move admin service to features/admin/
- Move user model to features/auth/
- Remove empty legacy folders (models/, services/)
- Align with domain-driven directory structure
```

---

### Commit 6: Remove Demo Mode Infrastructure (AFTER H2)
**Type**: `refactor`
**Files**:
- Implement repository pattern with DI
- Remove `DEMO_MODE` flag
- Remove conditional routing
- Update environment config

**Commit Message**:
```
refactor: replace DEMO_MODE flag with repository pattern

- Implement IRepository interfaces for data access
- Use dependency injection to swap implementations
- Remove DEMO_MODE environment variable
- Enable production-ready architecture
```

---

## 🛡️ SAFETY NOTES BEFORE CLEANUP

### 1. Test Coverage Required
**Before deleting files**, ensure:
- ✅ `npm run build` passes (frontend)
- ✅ `npm run build` passes (backend)
- ✅ Manual testing of:
  - Login flow
  - Product listing
  - Add to cart
  - Checkout
  - Admin panel

### 2. Database Migration Strategy
**If implementing Postgres**:
1. Create migration scripts to copy data from demo JSON files
2. Test migration in staging environment
3. Implement rollback mechanism
4. Run seed script for development databases

### 3. Breaking Changes
**ProductBadge.LIMITED change** will break:
- Any hardcoded badge checks
- Database data using 'limited-edition'
- Third-party integrations checking badges

**Mitigation**: Run migration script to update existing data.

### 4. Git Safety
**Before each commit**:
```bash
git checkout -b cleanup/[batch-name]
# Make changes
npm run build  # verify build
git commit
# Open PR for review
```

---

## 📊 SUMMARY METRICS

### Files to DELETE
- ❌ Backend: 6 files (routes/, postgres/, services/products.ts)
- ❌ Frontend: 2 files (services/products.ts, models/product.model.ts)
- **Total**: 8 files

### Files to MIGRATE
- 🔄 Backend: 2 files (admin.js, role.middleware.js)
- 🔄 Frontend: 2 files (admin.service.ts, user.model.ts)
- **Total**: 4 files

### Critical Bugs Found
1. ❌ **Production API points to localhost** (api.config.ts)
2. ❌ **ProductBadge type mismatch** (frontend vs backend)
3. ❌ **Hardcoded URLs** in 2 API files
4. ⚠️ **DEMO_MODE locks system** in file-based storage

### Architecture Issues
1. Mixed JavaScript/TypeScript (CJS/ESM conflict)
2. Dual router systems (old routes/ + new domain/)
3. Dual model systems (old models/ + new features/)
4. Dual login systems (auth/ + account/)
5. Prisma infrastructure present but non-functional

---

## ✅ RECOMMENDED IMMEDIATE ACTIONS

1. **TODAY**: Fix critical bugs (Commit 1)
   - Environment config
   - Badge type mismatch
   - Hardcoded URLs

2. **THIS WEEK**: Delete dead code (Commit 2)
   - Remove orphaned files
   - Clean up stubs

3. **THIS SPRINT**: TypeScript migration (Commits 3-5)
   - Convert JS to TS
   - Consolidate types
   - Clean up folders

4. **NEXT SPRINT**: Architecture decision
   - Implement Postgres OR commit to file-based storage
   - Remove DEMO_MODE infrastructure
   - Unify login systems

---

**END OF FORENSIC ANALYSIS**
