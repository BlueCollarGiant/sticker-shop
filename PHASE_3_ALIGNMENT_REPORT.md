# Phase 3 Alignment Report
## Night Reader Sticker Shop - Production Readiness Assessment

**Report Date**: 2025-12-01
**Current Status**: Post Phase 2 Cleanup
**Target**: Phase 3 Goals - End-to-End Checkout, Production Migration, Admin Expansion, UX Completion, Security Hardening

---

## Executive Summary

Your Phase 3 goals are **strategically sound** and represent the natural evolution from MVP demo to production-ready e-commerce platform. The current architecture **strongly supports** 80% of your objectives with minimal refactoring required. This report validates each goal against the existing system, identifies dependencies, and provides a concrete file-level implementation roadmap.

### Overall Readiness Assessment

| Goal Category | Current Support | Risk Level | Estimated Effort |
|---------------|----------------|------------|------------------|
| 1. End-to-End Checkout (Stripe) | 60% - Structure exists, needs integration | LOW | 1-2 weeks |
| 2. Production Migration (PostgreSQL) | 90% - Repository pattern ready | MEDIUM | 2-3 weeks |
| 3. Admin Panel Expansion | 80% - Framework complete | LOW | 1 week |
| 4. UX & Flow Completion | 40% - Needs CSS/validation work | LOW | 1-2 weeks |
| 5. Security & Hardening | 30% - Basic auth exists, needs layers | MEDIUM | 1 week |

**Key Finding**: Your Domain-Driven Design with repository pattern means database migration will be **clean and isolated**. The infrastructure swap can happen without touching business logic.

---

## Goal 1: Full End-to-End Checkout System

### Current State Analysis

✅ **What Already Exists**:
- [checkout.ts](frontend/src/app/components/checkout/checkout.ts) - Basic component with order creation logic
- [checkout.html](frontend/src/app/components/checkout/checkout.html) - Basic UI template
- [orders.js](backend/routes/orders.js) - Minimal order endpoints (POST `/api/orders/create`, GET `/api/orders`)
- Order creation logic (localStorage-based, user-isolated)
- Cart totals calculation (backend-driven)
- User authentication (required for checkout)

❌ **What's Missing**:
- Stripe integration (frontend + backend)
- Shipping address form
- Payment intent creation endpoint
- Webhook handler for payment confirmation
- Backend order persistence (currently in-memory array in `orders.js`)
- Order confirmation page component

### Architecture Validation

✅ **ARCHITECTURE SUPPORTS THIS** - The repository pattern is designed for this.

**Current Flow**:
```
Frontend: checkout.ts → localStorage → navigate to /orders
Backend: orders.js (in-memory, lost on restart)
```

**Target Flow**:
```
Frontend: checkout.ts → Stripe Elements → POST /api/orders/create-payment-intent
Backend: OrderService → Stripe API → Create PaymentIntent
Frontend: Confirm payment → Stripe confirms → Webhook triggers
Backend: Webhook → OrderService.createOrder() → OrderRepository.create() → DB
Frontend: Redirect to /order-confirmation/:orderId
```

### File-Level Implementation Map

#### Backend Files to Create/Modify

1. **`backend/src/domain/orders/order.types.ts`** (NEW)
   - Purpose: Define Order, OrderItem, OrderStatus types
   - Interfaces: `IOrderRepository` port
   ```typescript
   interface Order {
     id: string;
     orderNumber: string;
     userId: string;
     status: OrderStatus; // pending, processing, shipped, delivered, cancelled
     items: OrderItem[];
     subtotal: number;
     shipping: number;
     tax: number;
     total: number;
     shippingAddress: Address;
     paymentIntentId: string; // Stripe payment intent ID
     createdAt: Date;
     updatedAt: Date;
   }

   interface IOrderRepository {
     create(input: CreateOrderInput): Promise<Order>;
     findById(id: string): Promise<Order | null>;
     findByUserId(userId: string): Promise<Order[]>;
     updateStatus(id: string, status: OrderStatus): Promise<Order>;
   }
   ```

2. **`backend/src/domain/orders/order.service.ts`** (NEW)
   - Purpose: Business logic for order creation, Stripe integration
   - Methods:
     - `createPaymentIntent(amount, currency)` → Stripe API call
     - `createOrder(userId, cartItems, shippingAddress, paymentIntentId)` → Validate + create
     - `confirmPayment(paymentIntentId)` → Called by webhook
     - `getUserOrders(userId)` → Fetch user order history

3. **`backend/src/domain/orders/order.controller.ts`** (NEW)
   - Purpose: HTTP handlers for order endpoints
   - Routes:
     - `POST /api/orders/create-payment-intent` → Returns client secret
     - `POST /api/orders/create` → Creates order after payment confirmed
     - `GET /api/orders` → User's order history
     - `GET /api/orders/:id` → Single order detail
     - `POST /api/stripe/webhook` → Stripe webhook handler (validate signature)

4. **`backend/src/domain/orders/order.router.ts`** (NEW)
   - Purpose: Route definitions with DI setup
   - Middleware: `authenticate` for all routes except webhook

5. **`backend/src/infra/demo/demo-order.store.ts`** (NEW)
   - Purpose: File-based order storage (demo mode)
   - File: `backend/data/demo-orders.json`
   - Implements: `IOrderRepository`
   - Note: This is temporary for demo continuity, will be replaced by DB version

6. **`backend/package.json`** (MODIFY)
   - Add: `"stripe": "^14.0.0"`

7. **`backend/.env.example`** (MODIFY)
   - Add:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Frontend Files to Create/Modify

1. **`frontend/src/app/components/checkout/checkout.ts`** (MODIFY)
   - Add: Stripe Elements integration
   - Add: Shipping address form signals
   - Add: Payment intent creation call
   - Modify: `completeOrder()` → `submitPayment()` → Stripe confirm
   ```typescript
   shippingAddress = signal<ShippingAddress>({
     firstName: '',
     lastName: '',
     addressLine1: '',
     addressLine2: '',
     city: '',
     state: '',
     zipCode: '',
     country: 'US'
   });

   async submitPayment() {
     // Create payment intent
     const { clientSecret } = await this.orderApi.createPaymentIntent(total);

     // Confirm with Stripe
     const result = await this.stripe.confirmPayment({
       elements: this.stripeElements,
       clientSecret,
       confirmParams: {
         return_url: `${window.location.origin}/order-confirmation`
       }
     });

     if (result.error) {
       this.error.set(result.error.message);
     }
   }
   ```

2. **`frontend/src/app/components/checkout/checkout.html`** (MODIFY)
   - Add: Shipping address form (7 fields)
   - Add: Stripe Elements container (`<div id="stripe-elements"></div>`)
   - Add: Payment button instead of "Complete Order"
   - Add: Loading states
   - Add: Error display

3. **`frontend/src/app/components/order-confirmation/order-confirmation.ts`** (NEW)
   - Purpose: Post-payment success page
   - Load order by ID from URL params
   - Display: Order number, items, total, shipping address, status
   - Button: "View Order History" → `/dashboard/orders`

4. **`frontend/src/app/services/order.service.ts`** (NEW)
   - Purpose: API calls for orders
   - Methods:
     - `createPaymentIntent(amount): Observable<{ clientSecret }>`
     - `createOrder(input): Observable<Order>`
     - `getOrders(): Observable<Order[]>`
     - `getOrderById(id): Observable<Order>`

5. **`frontend/src/app/features/orders/order.store.ts`** (NEW - OPTIONAL)
   - Purpose: Signal-based order state management
   - Signals: `orders`, `selectedOrder`, `loading`, `error`
   - Note: Can defer this if order.service.ts direct calls are sufficient

6. **`frontend/package.json`** (MODIFY)
   - Add: `"@stripe/stripe-js": "^2.4.0"`

7. **`frontend/src/app/app.routes.ts`** (MODIFY)
   - Add route:
   ```typescript
   {
     path: 'order-confirmation',
     component: OrderConfirmationComponent,
     canActivate: [authGuard]
   }
   ```

### Dependency Order for Implementation

**CRITICAL**: Follow this sequence to avoid rework.

```
PHASE 1: Backend Foundation (Week 1)
├─ 1. Create order.types.ts (types + IOrderRepository)
├─ 2. Install Stripe SDK (npm install stripe)
├─ 3. Add Stripe env vars to .env
├─ 4. Create order.service.ts (Stripe integration)
├─ 5. Create demo-order.store.ts (file-based implementation)
└─ 6. Create order.controller.ts + order.router.ts

PHASE 2: Frontend Integration (Week 1-2)
├─ 7. Install Stripe.js (npm install @stripe/stripe-js)
├─ 8. Create order.service.ts (API calls)
├─ 9. Modify checkout.ts (add shipping form, Stripe Elements)
├─ 10. Modify checkout.html (add form UI + Stripe Elements)
├─ 11. Create order-confirmation.ts + template
└─ 12. Add route for order confirmation

PHASE 3: Testing & Refinement (Week 2)
├─ 13. Test full flow with Stripe test cards
├─ 14. Implement webhook handler + signature validation
├─ 15. Test webhook locally (Stripe CLI)
├─ 16. Handle edge cases (payment failed, timeout)
└─ 17. Add loading states + error handling
```

### Risk Assessment & Mitigations

#### Risk 1: Stripe Webhook Signature Validation
**Severity**: HIGH
**Impact**: Attackers could forge payment confirmations
**Mitigation**:
- Always validate `stripe.webhooks.constructEvent(body, signature, secret)`
- Use `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
- Log all webhook events for audit

#### Risk 2: Order Double-Creation
**Severity**: MEDIUM
**Impact**: User charged twice, duplicate orders
**Mitigation**:
- Use Stripe `paymentIntentId` as idempotency key
- Check if order with `paymentIntentId` already exists before creating
- Database unique constraint on `paymentIntentId` column

#### Risk 3: Cart Changes Between Payment Intent Creation and Confirmation
**Severity**: MEDIUM
**Impact**: User pays for different items than intended
**Mitigation**:
- Lock cart state when payment intent is created
- Store cart snapshot in payment intent metadata
- Validate cart hasn't changed before confirming payment

#### Risk 4: Demo Mode vs Production Mode Order Handling
**Severity**: LOW
**Impact**: Orders stored differently in demo vs production
**Mitigation**:
- Keep demo-order.store.ts for continuity
- Document migration path: demo-orders.json → PostgreSQL import script
- Use same `IOrderRepository` interface for both

### Recommended Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Insufficient Funds: 4000 0000 0000 9995
```

---

## Goal 2: Production Migration (PostgreSQL + Repository Swap)

### Current State Analysis

✅ **What Already Exists**:
- Repository pattern (`IAuthRepository`, `ICartRepository`, `IProductRepository`)
- Demo implementations (`DemoAuthStore`, `DemoCartStore`, `DemoProductStore`)
- Type-safe domain models
- Service layer decoupled from storage
- Environment-based mode switching (`DEMO_MODE` env var)

❌ **What's Missing**:
- PostgreSQL setup (local + production)
- Database schema definition
- Migration system (Prisma or TypeORM)
- Production repository implementations (`PostgresAuthRepository`, etc.)
- Database connection pooling
- bcrypt password hashing (required for production)

### Architecture Validation

✅✅✅ **ARCHITECTURE PERFECTLY SUPPORTS THIS** - This is exactly what the repository pattern was designed for.

**Your DDD structure enables a clean swap**:

```
BEFORE (Demo Mode):
AuthService → IAuthRepository → DemoAuthStore (demo-users.json)

AFTER (Production Mode):
AuthService → IAuthRepository → PostgresAuthRepository (PostgreSQL)
```

**NO CHANGES to**:
- `auth.service.ts` (business logic)
- `auth.controller.ts` (HTTP handlers)
- `auth.router.ts` (route definitions)
- Frontend code (API contracts unchanged)

**ONLY CHANGES**:
- Swap repository implementation in DI
- Add database connection setup
- Implement PostgreSQL repositories

### Database Schema Definition

#### Recommended Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hashed
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  category VARCHAR(100) NOT NULL,
  collection VARCHAR(100) NOT NULL,
  tags TEXT[], -- PostgreSQL array
  badges TEXT[], -- ['new', 'bestseller', etc.]
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_limited_edition BOOLEAN DEFAULT false,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product images (separate table for normalization)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Carts table (persisted carts)
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL, -- Snapshot price at time of add
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_intent_id VARCHAR(255) UNIQUE, -- Stripe payment intent ID (idempotency)
  shipping_address JSONB NOT NULL, -- Store as JSON
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL, -- Store product data at time of purchase
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_collection ON products(collection);
CREATE INDEX idx_products_badges ON products USING GIN(badges);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);
```

### File-Level Implementation Map

#### Step 1: Setup Prisma (Recommended ORM)

**Why Prisma?**
- TypeScript-native with excellent type generation
- Migration system built-in
- Query builder prevents SQL injection
- Developer-friendly CLI

1. **`backend/package.json`** (MODIFY)
   ```json
   "dependencies": {
     "@prisma/client": "^5.8.0",
     "bcrypt": "^5.1.1"
   },
   "devDependencies": {
     "prisma": "^5.8.0",
     "@types/bcrypt": "^5.0.2"
   }
   ```

2. **`backend/prisma/schema.prisma`** (NEW)
   - Define models matching SQL schema above
   - Prisma will generate TypeScript types + client
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model User {
     id           String   @id @default(uuid())
     email        String   @unique
     passwordHash String   @map("password_hash")
     name         String
     role         String   @default("user")
     createdAt    DateTime @default(now()) @map("created_at")
     updatedAt    DateTime @updatedAt @map("updated_at")

     carts   Cart[]
     orders  Order[]

     @@map("users")
   }

   model Product {
     id                String   @id @default(uuid())
     title             String
     subtitle          String?
     description       String
     price             Decimal  @db.Decimal(10, 2)
     salePrice         Decimal? @map("sale_price") @db.Decimal(10, 2)
     category          String
     collection        String
     tags              String[]
     badges            String[]
     rating            Decimal  @default(0) @db.Decimal(3, 2)
     reviewCount       Int      @default(0) @map("review_count")
     isNew             Boolean  @default(false) @map("is_new")
     isBestseller      Boolean  @default(false) @map("is_bestseller")
     isLimitedEdition  Boolean  @default(false) @map("is_limited_edition")
     stock             Int      @default(0)
     createdAt         DateTime @default(now()) @map("created_at")
     updatedAt         DateTime @updatedAt @map("updated_at")

     images     ProductImage[]
     cartItems  CartItem[]
     orderItems OrderItem[]

     @@map("products")
   }

   model ProductImage {
     id        String   @id @default(uuid())
     productId String   @map("product_id")
     url       String
     alt       String?
     isPrimary Boolean  @default(false) @map("is_primary")
     order     Int      @default(0)
     createdAt DateTime @default(now()) @map("created_at")

     product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

     @@map("product_images")
   }

   // ... (Cart, CartItem, Order, OrderItem models)
   ```

3. **`backend/.env.example`** (MODIFY)
   ```
   # Database (Production)
   DATABASE_URL=postgresql://user:password@localhost:5432/nightreader_db
   ```

4. **Run Prisma migrations**:
   ```bash
   cd backend
   npx prisma init
   npx prisma migrate dev --name init
   npx prisma generate
   ```

#### Step 2: Implement PostgreSQL Repositories

1. **`backend/src/infra/postgres/postgres-auth.repository.ts`** (NEW)
   - Implements: `IAuthRepository`
   - Uses: `PrismaClient`
   - Includes: bcrypt hashing for passwords
   ```typescript
   import { PrismaClient } from '@prisma/client';
   import bcrypt from 'bcrypt';
   import { IAuthRepository, User, RegisterUserInput } from '../../domain/auth/auth.types';

   export class PostgresAuthRepository implements IAuthRepository {
     constructor(private prisma: PrismaClient) {}

     async findUserByEmail(email: string): Promise<User | null> {
       const user = await this.prisma.user.findUnique({ where: { email } });
       if (!user) return null;

       return {
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role as 'user' | 'admin',
         createdAt: user.createdAt,
         updatedAt: user.updatedAt
       };
     }

     async createUser(input: RegisterUserInput): Promise<User> {
       const passwordHash = await bcrypt.hash(input.password, 10);

       const user = await this.prisma.user.create({
         data: {
           email: input.email,
           passwordHash,
           name: input.name,
           role: 'user'
         }
       });

       return {
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role as 'user' | 'admin',
         createdAt: user.createdAt,
         updatedAt: user.updatedAt
       };
     }

     async getUserWithPassword(email: string): Promise<(User & { password: string }) | null> {
       const user = await this.prisma.user.findUnique({ where: { email } });
       if (!user) return null;

       return {
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role as 'user' | 'admin',
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
         password: user.passwordHash // Note: This is the HASH, not plaintext
       };
     }
   }
   ```

2. **`backend/src/domain/auth/auth.service.ts`** (MODIFY)
   - Update login logic to use bcrypt.compare instead of plain text comparison
   ```typescript
   async login(email: string, password: string): Promise<LoginResult> {
     const user = await this.repository.getUserWithPassword(email);
     if (!user) throw new Error('Invalid credentials');

     // DEMO MODE: Plain-text comparison
     if (process.env.DEMO_MODE === 'true') {
       if (user.password !== password) throw new Error('Invalid credentials');
     }
     // PRODUCTION MODE: bcrypt comparison
     else {
       const isValid = await bcrypt.compare(password, user.password);
       if (!isValid) throw new Error('Invalid credentials');
     }

     // Generate JWT...
   }
   ```

3. **`backend/src/infra/postgres/postgres-product.repository.ts`** (NEW)
   - Implements: `IProductRepository`
   - Handles: Product CRUD with related images
   ```typescript
   export class PostgresProductRepository implements IProductRepository {
     constructor(private prisma: PrismaClient) {}

     async getAll(): Promise<ProductListResult> {
       const products = await this.prisma.product.findMany({
         include: { images: true },
         orderBy: { createdAt: 'desc' }
       });

       return {
         data: products.map(this.mapToProduct),
         total: products.length,
         page: 1,
         limit: products.length
       };
     }

     async getById(id: string): Promise<Product> {
       const product = await this.prisma.product.findUnique({
         where: { id },
         include: { images: true }
       });

       if (!product) throw new Error('Product not found');
       return this.mapToProduct(product);
     }

     private mapToProduct(dbProduct: any): Product {
       return {
         id: dbProduct.id,
         title: dbProduct.title,
         subtitle: dbProduct.subtitle,
         description: dbProduct.description,
         price: parseFloat(dbProduct.price),
         salePrice: dbProduct.salePrice ? parseFloat(dbProduct.salePrice) : undefined,
         category: dbProduct.category,
         collection: dbProduct.collection,
         images: dbProduct.images.map((img: any) => ({
           id: img.id,
           url: img.url,
           alt: img.alt,
           isPrimary: img.isPrimary,
           order: img.order
         })),
         tags: dbProduct.tags,
         badges: dbProduct.badges as ProductBadge[],
         rating: parseFloat(dbProduct.rating),
         reviewCount: dbProduct.reviewCount,
         isNew: dbProduct.isNew,
         isBestseller: dbProduct.isBestseller,
         isLimitedEdition: dbProduct.isLimitedEdition,
         stock: dbProduct.stock,
         createdAt: dbProduct.createdAt,
         updatedAt: dbProduct.updatedAt
       };
     }
   }
   ```

4. **`backend/src/infra/postgres/postgres-cart.repository.ts`** (NEW)
   - Implements: `ICartRepository`
   - Persists carts to database instead of in-memory Map

5. **`backend/src/infra/postgres/postgres-order.repository.ts`** (NEW)
   - Implements: `IOrderRepository`
   - Handles order creation with items

6. **`backend/src/infra/postgres/prisma-client.ts`** (NEW)
   - Purpose: Singleton PrismaClient instance
   ```typescript
   import { PrismaClient } from '@prisma/client';

   export const prisma = new PrismaClient({
     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
   });

   export async function connectDatabase() {
     try {
       await prisma.$connect();
       console.log('✅ Database connected');
     } catch (error) {
       console.error('❌ Database connection failed:', error);
       process.exit(1);
     }
   }

   export async function disconnectDatabase() {
     await prisma.$disconnect();
   }
   ```

#### Step 3: Dependency Injection Swap

1. **`backend/src/app.ts`** (MODIFY)
   - Add database connection on startup
   - Conditionally inject demo or production repositories
   ```typescript
   import { prisma, connectDatabase } from './infra/postgres/prisma-client';
   import { PostgresAuthRepository } from './infra/postgres/postgres-auth.repository';
   import { DemoAuthStore } from './infra/demo/demo-auth.store';

   export async function createApp() {
     const app = express();

     // Connect to database if not in demo mode
     if (process.env.DEMO_MODE !== 'true') {
       await connectDatabase();
     }

     // Dependency Injection: Choose repository based on mode
     const authRepository = process.env.DEMO_MODE === 'true'
       ? new DemoAuthStore()
       : new PostgresAuthRepository(prisma);

     const productRepository = process.env.DEMO_MODE === 'true'
       ? new DemoProductStore()
       : new PostgresProductRepository(prisma);

     // ... rest of app setup
   }
   ```

### Dependency Order for Implementation

```
PHASE 1: Database Setup (Week 1)
├─ 1. Install Prisma + bcrypt (npm install)
├─ 2. Setup PostgreSQL locally (Docker or native)
├─ 3. Create DATABASE_URL in .env
├─ 4. Initialize Prisma (npx prisma init)
├─ 5. Define schema.prisma (all models)
├─ 6. Run migration (npx prisma migrate dev --name init)
└─ 7. Generate Prisma client (npx prisma generate)

PHASE 2: Repository Implementation (Week 1-2)
├─ 8. Create prisma-client.ts (singleton + connection)
├─ 9. Implement PostgresAuthRepository
├─ 10. Implement PostgresProductRepository
├─ 11. Implement PostgresCartRepository
├─ 12. Implement PostgresOrderRepository
└─ 13. Add bcrypt logic to auth.service.ts

PHASE 3: DI Swap (Week 2)
├─ 14. Modify app.ts to conditionally inject repositories
├─ 15. Test with DEMO_MODE=false locally
├─ 16. Create seed script for production (migrate demo data)
├─ 17. Test all endpoints with PostgreSQL
└─ 18. Document migration process

PHASE 4: Production Deployment (Week 3)
├─ 19. Setup production PostgreSQL (AWS RDS, DigitalOcean, etc.)
├─ 20. Run migrations on production DB
├─ 21. Import seed data
├─ 22. Deploy backend with DEMO_MODE=false
└─ 23. Monitor for errors
```

### Risk Assessment & Mitigations

#### Risk 1: Data Migration from JSON to PostgreSQL
**Severity**: MEDIUM
**Impact**: Loss of demo products/users if not migrated correctly
**Mitigation**:
- Write migration script: `scripts/migrate-demo-to-postgres.ts`
- Read `demo-users.json` and `demo-products.json`
- Insert into PostgreSQL using Prisma
- Hash passwords during migration
- Verify counts match before deleting JSON files

#### Risk 2: bcrypt Hashing Breaks Demo Mode
**Severity**: LOW
**Impact**: Demo users can't log in if hashing applied incorrectly
**Mitigation**:
- Keep demo mode using plain-text comparison
- Only apply bcrypt when `DEMO_MODE=false`
- Explicitly check mode in `auth.service.ts` login method

#### Risk 3: Prisma Schema Changes Require Migrations
**Severity**: LOW
**Impact**: Schema drift between dev and prod
**Mitigation**:
- Always use `prisma migrate dev` locally
- Commit migration files to git
- Run `prisma migrate deploy` on production
- Never edit database schema manually

#### Risk 4: Connection Pool Exhaustion
**Severity**: MEDIUM
**Impact**: Database connections leak, server crashes
**Mitigation**:
- Use PrismaClient singleton pattern
- Set connection pool limits in DATABASE_URL: `?connection_limit=10`
- Implement graceful shutdown: disconnect on SIGTERM

---

## Goal 3: Expand Admin Panel

### Current State Analysis

✅ **What Already Exists**:
- Admin panel component with tabs (General, Products, Sales, Users)
- Product management (CRUD, stock updates, badge toggles)
- User management (list users, view user details, view user orders)
- Role-based access (adminGuard)
- Demo admin routes (`/api/demo/admin/products`, `/api/demo/admin/users`)

❌ **What's Missing**:
- Admin order management (view all orders, update order status)
- Sales analytics (revenue charts, top products, conversion rates)
- User editing (change role, reset password, delete account)
- Bulk operations (bulk delete products, bulk update stock)

### Architecture Validation

✅ **ARCHITECTURE SUPPORTS THIS** - Admin panel structure is extensible.

**Current Tab Structure**:
```
AdminPanel Component
├─ General Tab (stats overview)
├─ Products Tab (CRUD + stock + badges) ✅ Complete
├─ Sales Tab (placeholder) ❌ Empty
└─ Users Tab (list + view orders) 🟡 Partial
```

**Target Structure**:
```
AdminPanel Component
├─ General Tab (enhanced stats)
├─ Products Tab ✅ (keep as-is)
├─ Orders Tab ⭐ (NEW - order management)
├─ Sales Tab ⭐ (NEW - analytics)
└─ Users Tab (+ edit/delete capabilities)
```

### File-Level Implementation Map

#### Backend Files to Create/Modify

1. **`backend/routes/demo/admin.js`** (MODIFY)
   - Add routes for admin order management
   ```javascript
   // GET /api/demo/admin/orders - List all orders (all users)
   router.get('/orders', requireAdmin, async (req, res) => {
     // In demo mode, orders are in localStorage (frontend-side)
     // Return guidance to admin to view via user management
     res.json({
       success: true,
       data: [],
       message: 'In demo mode, orders are stored in browser localStorage. Use the Users tab to view individual user orders.'
     });
   });

   // PATCH /api/demo/admin/orders/:orderId/status
   router.patch('/orders/:orderId/status', requireAdmin, async (req, res) => {
     // Future: Update order status in database
     res.json({
       success: true,
       message: 'Order status updated (demo mode - not persisted)'
     });
   });
   ```

2. **`backend/src/domain/orders/order.controller.ts`** (MODIFY - once DB exists)
   - Add admin-only endpoints:
     - `GET /api/orders/all` (admin only) → All orders across users
     - `PATCH /api/orders/:id/status` (admin only) → Update order status

3. **`backend/routes/demo/admin.js`** (MODIFY)
   - Add analytics endpoint
   ```javascript
   // GET /api/demo/admin/analytics
   router.get('/analytics', requireAdmin, async (req, res) => {
     const products = JSON.parse(fs.readFileSync('./data/demo-products.json'));

     const analytics = {
       totalRevenue: 0, // Calculate from orders once DB exists
       totalOrders: 0,
       averageOrderValue: 0,
       topProducts: products
         .sort((a, b) => b.reviewCount - a.reviewCount)
         .slice(0, 5)
         .map(p => ({ id: p.id, title: p.title, revenue: 0 })),
       recentOrders: [],
       conversionRate: 0
     };

     res.json({ success: true, data: analytics });
   });
   ```

4. **`backend/routes/demo/admin.js`** (MODIFY)
   - Add user editing endpoints
   ```javascript
   // PATCH /api/demo/admin/users/:userId
   router.patch('/users/:userId', requireAdmin, async (req, res) => {
     const { name, email, role } = req.body;

     const users = JSON.parse(fs.readFileSync('./data/demo-users.json'));
     const userIndex = users.findIndex(u => u.id === req.params.userId);

     if (userIndex === -1) {
       return res.status(404).json({ success: false, error: 'User not found' });
     }

     users[userIndex] = {
       ...users[userIndex],
       name: name || users[userIndex].name,
       email: email || users[userIndex].email,
       role: role || users[userIndex].role,
       updatedAt: new Date().toISOString()
     };

     fs.writeFileSync('./data/demo-users.json', JSON.stringify(users, null, 2));

     const { password, ...safeUser } = users[userIndex];
     res.json({ success: true, data: safeUser });
   });

   // DELETE /api/demo/admin/users/:userId
   router.delete('/users/:userId', requireAdmin, async (req, res) => {
     const users = JSON.parse(fs.readFileSync('./data/demo-users.json'));
     const filtered = users.filter(u => u.id !== req.params.userId);

     if (filtered.length === users.length) {
       return res.status(404).json({ success: false, error: 'User not found' });
     }

     fs.writeFileSync('./data/demo-users.json', JSON.stringify(filtered, null, 2));
     res.json({ success: true, message: 'User deleted' });
   });
   ```

#### Frontend Files to Create/Modify

1. **`frontend/src/app/components/admin/admin-panel/admin-panel.ts`** (MODIFY)
   - Add `activeTab = signal<'general' | 'products' | 'orders' | 'sales' | 'users'>('general')`
   - Add orders state:
   ```typescript
   allOrders = signal<Order[]>([]);
   loadingOrders = signal(false);
   selectedOrderId = signal<string | null>(null);

   loadAllOrders() {
     this.loadingOrders.set(true);
     // In demo mode, aggregate orders from all users' localStorage
     const users = this.users();
     const allOrders: Order[] = [];

     users.forEach(user => {
       const storageKey = `user_orders_${user.id}`;
       const userOrders = localStorage.getItem(storageKey);
       if (userOrders) {
         const parsed = JSON.parse(userOrders);
         allOrders.push(...parsed.map(o => ({ ...o, userName: user.name })));
       }
     });

     this.allOrders.set(allOrders.sort((a, b) =>
       new Date(b.date).getTime() - new Date(a.date).getTime()
     ));
     this.loadingOrders.set(false);
   }

   updateOrderStatus(orderId: string, newStatus: string) {
     // Find order in localStorage and update
     // In production, call backend API
   }
   ```

2. **`frontend/src/app/components/admin/admin-panel/admin-panel.html`** (MODIFY)
   - Add Orders tab
   ```html
   <nav class="admin-tabs">
     <button (click)="activeTab.set('general')" [class.active]="activeTab() === 'general'">
       General
     </button>
     <button (click)="activeTab.set('products')" [class.active]="activeTab() === 'products'">
       Products
     </button>
     <button (click)="activeTab.set('orders')" [class.active]="activeTab() === 'orders'">
       Orders
     </button>
     <button (click)="activeTab.set('sales')" [class.active]="activeTab() === 'sales'">
       Sales
     </button>
     <button (click)="activeTab.set('users')" [class.active]="activeTab() === 'users'">
       Users
     </button>
   </nav>

   <!-- Orders Tab -->
   @if (activeTab() === 'orders') {
     <header class="admin-header">
       <h1 class="admin-title">Order Management</h1>
       <p class="admin-subtitle">{{ allOrders().length }} total orders</p>
     </header>

     <div class="orders-table">
       @for (order of allOrders(); track order.id) {
         <div class="order-row">
           <div class="order-number">#{{ order.orderNumber }}</div>
           <div class="order-user">{{ order.userName }}</div>
           <div class="order-date">{{ formatDate(order.date) }}</div>
           <div class="order-status">
             <select [(ngModel)]="order.status"
                     (change)="updateOrderStatus(order.id, order.status)">
               <option value="pending">Pending</option>
               <option value="processing">Processing</option>
               <option value="shipped">Shipped</option>
               <option value="delivered">Delivered</option>
               <option value="cancelled">Cancelled</option>
             </select>
           </div>
           <div class="order-total">${{ order.total.toFixed(2) }}</div>
           <div class="order-items">{{ order.items.length }} items</div>
           <button (click)="viewOrderDetails(order.id)">View</button>
         </div>
       }
     </div>
   }

   <!-- Sales Tab -->
   @if (activeTab() === 'sales') {
     <header class="admin-header">
       <h1 class="admin-title">Sales Analytics</h1>
     </header>

     <div class="analytics-grid">
       <div class="stat-card">
         <h3>Total Revenue</h3>
         <p class="stat-value">${{ analytics().totalRevenue.toFixed(2) }}</p>
       </div>
       <div class="stat-card">
         <h3>Total Orders</h3>
         <p class="stat-value">{{ analytics().totalOrders }}</p>
       </div>
       <div class="stat-card">
         <h3>Average Order Value</h3>
         <p class="stat-value">${{ analytics().averageOrderValue.toFixed(2) }}</p>
       </div>
       <div class="stat-card">
         <h3>Conversion Rate</h3>
         <p class="stat-value">{{ analytics().conversionRate }}%</p>
       </div>
     </div>

     <div class="top-products">
       <h2>Top Products</h2>
       @for (product of analytics().topProducts; track product.id) {
         <div class="product-stat">
           <span>{{ product.title }}</span>
           <span>${{ product.revenue.toFixed(2) }}</span>
         </div>
       }
     </div>
   }
   ```

3. **`frontend/src/app/services/admin.service.ts`** (MODIFY)
   - Add methods:
   ```typescript
   getAllOrders(): Observable<{ success: boolean; data: Order[] }> {
     return this.http.get<{ success: boolean; data: Order[] }>(
       `${this.API_URL}/orders`
     );
   }

   updateOrderStatus(orderId: string, status: string): Observable<any> {
     return this.http.patch(
       `${this.API_URL}/orders/${orderId}/status`,
       { status }
     );
   }

   getAnalytics(): Observable<{ success: boolean; data: Analytics }> {
     return this.http.get<{ success: boolean; data: Analytics }>(
       `${this.API_URL}/analytics`
     );
   }

   updateUser(userId: string, updates: Partial<User>): Observable<any> {
     return this.http.patch(
       `${this.API_URL}/users/${userId}`,
       updates
     );
   }

   deleteUser(userId: string): Observable<any> {
     return this.http.delete(`${this.API_URL}/users/${userId}`);
   }
   ```

4. **`frontend/src/app/components/admin/admin-panel/admin-panel.html`** (MODIFY - Users Tab)
   - Add edit/delete buttons to user cards
   ```html
   <div class="user-actions">
     <button class="btn-edit" (click)="editUser(user)">Edit</button>
     <button class="btn-delete" (click)="confirmDeleteUser(user)">Delete</button>
   </div>
   ```

5. **`frontend/src/app/components/admin/user-editor-modal/user-editor-modal.ts`** (NEW)
   - Purpose: Modal for editing user details
   - Fields: name, email, role (dropdown: user/admin)
   - Save button calls `adminService.updateUser()`

### Dependency Order for Implementation

```
PHASE 1: Backend Admin Endpoints (2-3 days)
├─ 1. Add analytics endpoint to admin.js
├─ 2. Add order management endpoints (get all, update status)
├─ 3. Add user editing endpoints (PATCH, DELETE)
└─ 4. Test all endpoints with Postman

PHASE 2: Frontend Orders Tab (2-3 days)
├─ 5. Add Orders tab to admin panel HTML
├─ 6. Implement loadAllOrders() method (aggregate localStorage)
├─ 7. Add order table with status dropdown
├─ 8. Add updateOrderStatus() method
└─ 9. Style orders table

PHASE 3: Frontend Sales Tab (2 days)
├─ 10. Add Sales tab to admin panel HTML
├─ 11. Create analytics signal
├─ 12. Call adminService.getAnalytics() on tab load
├─ 13. Display stat cards + top products
└─ 14. Style analytics dashboard

PHASE 4: User Editing (2 days)
├─ 15. Create user-editor-modal component
├─ 16. Add edit/delete buttons to Users tab
├─ 17. Implement editUser() and deleteUser() methods
├─ 18. Add confirmation modal for delete
└─ 19. Update users list after edit/delete
```

### Risk Assessment

#### Risk 1: Order Management in Demo Mode (localStorage)
**Severity**: MEDIUM
**Impact**: Admin can't actually manage orders stored in user browsers
**Mitigation**:
- Document limitation: "Demo mode orders are browser-local"
- Add note in Orders tab: "Full order management available in production mode"
- Migrate to database-backed orders with Goal 2 completion

#### Risk 2: User Deletion Cascade (Orders Become Orphaned)
**Severity**: LOW
**Impact**: Deleted user's orders still show their name
**Mitigation**:
- Don't hard-delete users, use soft delete (is_deleted flag)
- Or set user_id to NULL on delete (anonymous orders)
- Database foreign key: ON DELETE SET NULL

---

## Goal 4: UX & Flow Completion

### Current State Analysis

✅ **What Already Exists**:
- Basic responsive breakpoints (minimal)
- Some form validation (email format in login)
- Loading signals in stores
- Error signals in stores

❌ **What's Missing**:
- Mobile-optimized navigation (hamburger menu)
- Responsive product grid (columns adapt to screen size)
- Touch-friendly controls (larger tap targets)
- Loading skeletons for product grids
- Comprehensive form validation (client-side + server-side)
- Error message display below form fields
- Success states (checkmarks, animations)
- Disabled submit buttons during loading

### Architecture Validation

✅ **ARCHITECTURE SUPPORTS THIS** - Signals already track loading/error states.

**Current Pattern**:
```typescript
loading = signal(false);
error = signal<string | null>(null);

// Template
@if (loading()) {
  <p>Loading...</p>
}
```

**Enhanced Pattern**:
```typescript
loading = signal(false);
error = signal<string | null>(null);
success = signal(false);

// Template
@if (loading()) {
  <div class="skeleton-grid">
    @for (i of [1,2,3,4]; track i) {
      <div class="skeleton-card"></div>
    }
  </div>
}
```

### File-Level Implementation Map

#### Responsive Design Files

1. **`frontend/src/app/app.css`** (MODIFY)
   - Add global responsive breakpoints
   ```css
   /* Mobile breakpoints */
   :root {
     --mobile-max: 640px;
     --tablet-max: 1024px;
     --desktop-min: 1025px;
   }

   /* Responsive container */
   .container {
     width: 100%;
     max-width: 1200px;
     margin: 0 auto;
     padding: 0 1rem;
   }

   @media (min-width: 768px) {
     .container {
       padding: 0 2rem;
     }
   }

   /* Mobile navigation */
   @media (max-width: 640px) {
     nav.desktop-nav {
       display: none;
     }

     nav.mobile-nav {
       display: flex;
     }
   }
   ```

2. **`frontend/src/app/app.html`** (MODIFY)
   - Add mobile hamburger menu
   ```html
   <!-- Desktop Navigation (existing) -->
   <nav class="desktop-nav">
     <!-- existing nav -->
   </nav>

   <!-- Mobile Navigation (NEW) -->
   <nav class="mobile-nav">
     <div class="mobile-header">
       <div class="logo">Night Reader</div>
       <button class="hamburger" (click)="toggleMobileMenu()">
         @if (mobileMenuOpen()) {
           ✕
         } @else {
           ☰
         }
       </button>
     </div>

     @if (mobileMenuOpen()) {
       <div class="mobile-menu">
         <a routerLink="/" (click)="closeMobileMenu()">Home</a>
         <a routerLink="/products" (click)="closeMobileMenu()">Shop</a>
         <a routerLink="/cart" (click)="closeMobileMenu()">
           Cart ({{ cartStore.items().length }})
         </a>
         @if (auth.isAuthenticated()) {
           <a routerLink="/dashboard" (click)="closeMobileMenu()">Dashboard</a>
           <a routerLink="/dashboard/orders" (click)="closeMobileMenu()">Orders</a>
           <a routerLink="/settings" (click)="closeMobileMenu()">Settings</a>
           <button (click)="logout()">Logout</button>
         } @else {
           <a routerLink="/account/login" (click)="closeMobileMenu()">Login</a>
         }
       </div>
     }
   </nav>
   ```

3. **`frontend/src/app/app.ts`** (MODIFY)
   - Add mobile menu state
   ```typescript
   mobileMenuOpen = signal(false);

   toggleMobileMenu() {
     this.mobileMenuOpen.update(v => !v);
   }

   closeMobileMenu() {
     this.mobileMenuOpen.set(false);
   }
   ```

4. **`frontend/src/app/components/products/products.css`** (MODIFY)
   - Add responsive grid
   ```css
   .products-grid {
     display: grid;
     gap: 1.5rem;

     /* Mobile: 1 column */
     grid-template-columns: 1fr;

     /* Tablet: 2 columns */
     @media (min-width: 640px) {
       grid-template-columns: repeat(2, 1fr);
     }

     /* Desktop: 3 columns */
     @media (min-width: 1024px) {
       grid-template-columns: repeat(3, 1fr);
     }

     /* Large desktop: 4 columns */
     @media (min-width: 1280px) {
       grid-template-columns: repeat(4, 1fr);
     }
   }

   .product-card {
     /* Ensure touch-friendly tap targets */
     min-height: 44px;
   }

   .product-card button {
     /* iOS/Android recommended tap target */
     min-height: 48px;
     font-size: 16px; /* Prevents iOS zoom on input focus */
   }
   ```

#### Loading States & Skeletons

1. **`frontend/src/app/shared/skeleton/skeleton-product-card.ts`** (NEW)
   - Purpose: Reusable skeleton loader for products
   ```typescript
   @Component({
     selector: 'app-skeleton-product-card',
     standalone: true,
     template: `
       <div class="skeleton-card">
         <div class="skeleton-image"></div>
         <div class="skeleton-text skeleton-title"></div>
         <div class="skeleton-text skeleton-subtitle"></div>
         <div class="skeleton-text skeleton-price"></div>
       </div>
     `,
     styleUrl: './skeleton.css'
   })
   export class SkeletonProductCard {}
   ```

2. **`frontend/src/app/shared/skeleton/skeleton.css`** (NEW)
   ```css
   .skeleton-card {
     background: #fff;
     border-radius: 8px;
     padding: 1rem;
     animation: pulse 1.5s ease-in-out infinite;
   }

   .skeleton-image {
     width: 100%;
     height: 200px;
     background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
     background-size: 200% 100%;
     animation: shimmer 1.5s infinite;
     border-radius: 4px;
   }

   .skeleton-text {
     height: 16px;
     background: #f0f0f0;
     margin-top: 0.5rem;
     border-radius: 4px;
   }

   .skeleton-title { width: 80%; height: 20px; }
   .skeleton-subtitle { width: 60%; }
   .skeleton-price { width: 40%; }

   @keyframes shimmer {
     0% { background-position: -200% 0; }
     100% { background-position: 200% 0; }
   }

   @keyframes pulse {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.5; }
   }
   ```

3. **`frontend/src/app/components/products/products.html`** (MODIFY)
   - Replace simple loading message with skeletons
   ```html
   @if (productStore.loading()) {
     <div class="products-grid">
       @for (i of [1, 2, 3, 4, 5, 6]; track i) {
         <app-skeleton-product-card />
       }
     </div>
   } @else if (productStore.error()) {
     <div class="error-state">
       <p>{{ productStore.error() }}</p>
       <button (click)="retry()">Retry</button>
     </div>
   } @else {
     <!-- existing product grid -->
   }
   ```

#### Form Validation Enhancement

1. **`frontend/src/app/components/account/login/login.ts`** (MODIFY)
   - Add comprehensive validation
   ```typescript
   email = signal('');
   password = signal('');
   emailError = signal<string | null>(null);
   passwordError = signal<string | null>(null);

   validateEmail() {
     const value = this.email();
     if (!value) {
       this.emailError.set('Email is required');
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
       this.emailError.set('Please enter a valid email address');
     } else {
       this.emailError.set(null);
     }
   }

   validatePassword() {
     const value = this.password();
     if (!value) {
       this.passwordError.set('Password is required');
     } else if (value.length < 6) {
       this.passwordError.set('Password must be at least 6 characters');
     } else {
       this.passwordError.set(null);
     }
   }

   isFormValid = computed(() =>
     !this.emailError() &&
     !this.passwordError() &&
     this.email().length > 0 &&
     this.password().length > 0
   );

   onSubmit() {
     this.validateEmail();
     this.validatePassword();

     if (!this.isFormValid()) return;

     this.auth.login(this.email(), this.password());
   }
   ```

2. **`frontend/src/app/components/account/login/login.html`** (MODIFY)
   - Add error display + disabled state
   ```html
   <form (ngSubmit)="onSubmit()">
     <div class="form-group">
       <label for="email">Email</label>
       <input
         id="email"
         type="email"
         [(ngModel)]="email"
         (blur)="validateEmail()"
         [class.error]="emailError()"
         placeholder="you@example.com"
       />
       @if (emailError()) {
         <span class="error-message">{{ emailError() }}</span>
       }
     </div>

     <div class="form-group">
       <label for="password">Password</label>
       <input
         id="password"
         type="password"
         [(ngModel)]="password"
         (blur)="validatePassword()"
         [class.error]="passwordError()"
         placeholder="••••••••"
       />
       @if (passwordError()) {
         <span class="error-message">{{ passwordError() }}</span>
       }
     </div>

     <button
       type="submit"
       [disabled]="!isFormValid() || auth.loading()"
       class="btn-primary"
     >
       @if (auth.loading()) {
         <span class="spinner"></span> Signing in...
       } @else {
         Sign In
       }
     </button>

     @if (auth.error()) {
       <div class="alert alert-error">{{ auth.error() }}</div>
     }
   </form>
   ```

3. **`frontend/src/styles/forms.css`** (NEW - Global Form Styles)
   ```css
   .form-group {
     margin-bottom: 1.5rem;
   }

   .form-group label {
     display: block;
     margin-bottom: 0.5rem;
     font-weight: 500;
     color: #333;
   }

   .form-group input,
   .form-group select,
   .form-group textarea {
     width: 100%;
     padding: 0.75rem;
     border: 2px solid #e0e0e0;
     border-radius: 4px;
     font-size: 16px; /* Prevents iOS zoom */
     transition: border-color 0.2s;
   }

   .form-group input:focus,
   .form-group select:focus,
   .form-group textarea:focus {
     outline: none;
     border-color: #4CAF50;
   }

   .form-group input.error,
   .form-group select.error,
   .form-group textarea.error {
     border-color: #f44336;
   }

   .error-message {
     display: block;
     margin-top: 0.25rem;
     font-size: 0.875rem;
     color: #f44336;
   }

   button:disabled {
     opacity: 0.6;
     cursor: not-allowed;
   }

   .spinner {
     display: inline-block;
     width: 16px;
     height: 16px;
     border: 2px solid rgba(255, 255, 255, 0.3);
     border-top-color: #fff;
     border-radius: 50%;
     animation: spin 0.6s linear infinite;
   }

   @keyframes spin {
     to { transform: rotate(360deg); }
   }
   ```

### Dependency Order for Implementation

```
PHASE 1: Responsive Design (Week 1)
├─ 1. Add global responsive breakpoints to app.css
├─ 2. Create mobile navigation component
├─ 3. Update product grid CSS (responsive columns)
├─ 4. Update cart drawer for mobile
├─ 5. Test on mobile devices (iOS Safari, Chrome Android)
└─ 6. Add touch-friendly tap targets (min 48px)

PHASE 2: Loading States (Week 1)
├─ 7. Create skeleton components (product card, user card)
├─ 8. Replace loading text with skeletons in products.html
├─ 9. Add skeletons to admin panel tables
├─ 10. Add button loading spinners
└─ 11. Add disabled states during API calls

PHASE 3: Form Validation (Week 2)
├─ 12. Create global form styles (forms.css)
├─ 13. Enhance login form (validation + errors)
├─ 14. Enhance signup form (validation + errors)
├─ 15. Enhance checkout form (validation + errors)
├─ 16. Add backend validation schemas (Zod)
└─ 17. Display backend validation errors in frontend
```

### Risk Assessment

#### Risk 1: iOS Zoom on Input Focus (font-size < 16px)
**Severity**: LOW
**Impact**: Bad UX - iOS zooms page when focusing small inputs
**Mitigation**: Set all input `font-size: 16px` minimum

#### Risk 2: Skeleton Count Mismatch
**Severity**: LOW
**Impact**: UI shift when loading completes
**Mitigation**: Match skeleton count to expected result count

---

## Goal 5: Security & Hardening

### Current State Analysis

✅ **What Already Exists**:
- JWT authentication
- CORS configuration
- Basic input validation (some Zod schemas)
- Role-based access control (admin middleware)
- Password storage (plain-text in demo, needs hashing)

❌ **What's Missing**:
- bcrypt password hashing (critical for production)
- Rate limiting (prevent brute-force)
- Security headers (Helmet.js)
- CSRF protection (if using cookies)
- Input sanitization (XSS prevention)
- Request size limits
- SQL injection prevention (handled by Prisma, but needs verification)

### Architecture Validation

✅ **ARCHITECTURE SUPPORTS THIS** - Middleware can be added to app.ts.

**Current Middleware Stack**:
```
app.use(cors())
app.use(express.json())
app.use(routes)
app.use(errorHandler)
```

**Target Middleware Stack**:
```
app.use(helmet()) // Security headers
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Request size limit
app.use(rateLimiter) // Rate limiting
app.use(routes)
app.use(errorHandler)
```

### File-Level Implementation Map

#### Backend Files to Create/Modify

1. **`backend/package.json`** (MODIFY)
   - Add security packages
   ```json
   "dependencies": {
     "helmet": "^7.1.0",
     "express-rate-limit": "^7.1.5",
     "express-mongo-sanitize": "^2.2.0", // If using MongoDB, or
     "xss-clean": "^0.1.4"
   }
   ```

2. **`backend/src/middleware/security.middleware.ts`** (NEW)
   - Purpose: Centralized security middleware
   ```typescript
   import helmet from 'helmet';
   import rateLimit from 'express-rate-limit';
   import mongoSanitize from 'express-mongo-sanitize';
   import xss from 'xss-clean';

   // Helmet: Security headers
   export const securityHeaders = helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", 'data:', 'https:'],
       },
     },
     hsts: {
       maxAge: 31536000,
       includeSubDomains: true,
       preload: true
     }
   });

   // Rate limiter for login attempts
   export const loginRateLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 attempts per window
     message: 'Too many login attempts, please try again later',
     standardHeaders: true,
     legacyHeaders: false,
   });

   // General API rate limiter
   export const apiRateLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // 100 requests per window
     message: 'Too many requests, please slow down',
   });

   // Data sanitization against NoSQL injection
   export const sanitizeData = mongoSanitize();

   // XSS protection
   export const xssProtection = xss();
   ```

3. **`backend/src/app.ts`** (MODIFY)
   - Add security middleware to stack
   ```typescript
   import {
     securityHeaders,
     apiRateLimiter,
     sanitizeData,
     xssProtection
   } from './middleware/security.middleware';

   export function createApp() {
     const app = express();

     // Security headers (first)
     app.use(securityHeaders);

     // CORS
     app.use(cors({
       origin: process.env.ALLOWED_ORIGINS.split(','),
       credentials: true
     }));

     // Body parsing with size limit
     app.use(express.json({ limit: '10mb' }));
     app.use(express.urlencoded({ extended: true, limit: '10mb' }));

     // Data sanitization
     app.use(sanitizeData);
     app.use(xssProtection);

     // Rate limiting (global)
     app.use('/api', apiRateLimiter);

     // Routes
     app.use('/api/auth', authRouter);
     // ...

     // Error handler (last)
     app.use(errorHandler);

     return app;
   }
   ```

4. **`backend/src/domain/auth/auth.router.ts`** (MODIFY)
   - Add rate limiter to login endpoint
   ```typescript
   import { loginRateLimiter } from '../../middleware/security.middleware';

   router.post('/login', loginRateLimiter, controller.login);
   router.post('/register', loginRateLimiter, controller.register);
   ```

5. **`backend/src/middleware/validate.ts`** (MODIFY)
   - Enhance validation with detailed error messages
   ```typescript
   export const validate = (schema: ZodSchema) => (req, res, next) => {
     const result = schema.safeParse(req.body);

     if (!result.success) {
       const errors = result.error.errors.map(err => ({
         field: err.path.join('.'),
         message: err.message
       }));

       return res.status(400).json({
         success: false,
         error: 'Validation failed',
         details: errors
       });
     }

     // Replace req.body with parsed data (sanitized)
     req.body = result.data;
     next();
   };
   ```

6. **`backend/src/domain/auth/auth.schemas.ts`** (NEW)
   - Add comprehensive validation schemas
   ```typescript
   import { z } from 'zod';

   export const loginSchema = z.object({
     email: z.string()
       .email('Invalid email format')
       .min(5, 'Email too short')
       .max(255, 'Email too long'),
     password: z.string()
       .min(6, 'Password must be at least 6 characters')
       .max(128, 'Password too long')
   });

   export const registerSchema = z.object({
     email: z.string()
       .email('Invalid email format')
       .min(5, 'Email too short')
       .max(255, 'Email too long'),
     password: z.string()
       .min(6, 'Password must be at least 6 characters')
       .max(128, 'Password too long')
       .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
       .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
       .regex(/[0-9]/, 'Password must contain at least one number'),
     name: z.string()
       .min(2, 'Name too short')
       .max(100, 'Name too long')
       .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
   });

   export const updatePasswordSchema = z.object({
     currentPassword: z.string().min(1, 'Current password required'),
     newPassword: z.string()
       .min(6, 'Password must be at least 6 characters')
       .max(128, 'Password too long')
       .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
       .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
       .regex(/[0-9]/, 'Password must contain at least one number')
   });
   ```

7. **`backend/src/domain/auth/auth.router.ts`** (MODIFY)
   - Use validation schemas
   ```typescript
   import { validate } from '../../middleware/validate';
   import { loginSchema, registerSchema } from './auth.schemas';

   router.post('/login', loginRateLimiter, validate(loginSchema), controller.login);
   router.post('/register', loginRateLimiter, validate(registerSchema), controller.register);
   ```

8. **`backend/.env.example`** (MODIFY)
   - Add security configuration
   ```
   # Security
   RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
   RATE_LIMIT_MAX_REQUESTS=100
   LOGIN_RATE_LIMIT_MAX=5
   ```

### Dependency Order for Implementation

```
PHASE 1: Password Hashing (Critical - Week 1)
├─ 1. Install bcrypt (npm install bcrypt @types/bcrypt)
├─ 2. Update PostgresAuthRepository to hash passwords
├─ 3. Update auth.service.ts to use bcrypt.compare()
├─ 4. Test login/register with hashed passwords
└─ 5. Create migration script to hash existing demo passwords

PHASE 2: Rate Limiting (Week 1)
├─ 6. Install express-rate-limit
├─ 7. Create security.middleware.ts
├─ 8. Add loginRateLimiter to auth routes
├─ 9. Add apiRateLimiter globally
└─ 10. Test rate limiting (automated script)

PHASE 3: Security Headers (Week 1)
├─ 11. Install helmet
├─ 12. Add helmet middleware to app.ts
├─ 13. Configure CSP directives
├─ 14. Test with browser dev tools (check headers)
└─ 15. Add HSTS header

PHASE 4: Input Validation & Sanitization (Week 2)
├─ 16. Create comprehensive Zod schemas
├─ 17. Install xss-clean + mongo-sanitize
├─ 18. Add sanitization middleware
├─ 19. Apply validation to all POST/PUT/PATCH endpoints
└─ 20. Test with malicious inputs (XSS, SQL injection attempts)
```

### Security Testing Checklist

#### Test Cases

1. **Rate Limiting**:
   - Attempt 6 logins in < 15 minutes → Should block 6th attempt
   - Wait 15 minutes → Should allow login again
   - Attempt 101 API calls in < 15 minutes → Should block

2. **Password Hashing**:
   - Register new user → Check DB password is hashed (starts with `$2b$`)
   - Login with correct password → Should succeed
   - Login with wrong password → Should fail

3. **XSS Prevention**:
   - Submit form with `<script>alert('XSS')</script>` → Should sanitize
   - Check response doesn't include unescaped script tags

4. **SQL Injection** (if using raw queries):
   - Input: `email=' OR '1'='1` → Should fail validation
   - Prisma parameterized queries should prevent this by default

5. **CORS**:
   - Request from unauthorized origin → Should block
   - Request from allowed origin → Should allow

6. **Security Headers**:
   - Check response headers include:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Strict-Transport-Security: max-age=31536000`
     - `Content-Security-Policy: default-src 'self'`

### Risk Assessment

#### Risk 1: Bcrypt Hash Rounds Too High
**Severity**: LOW
**Impact**: Slow login response times
**Mitigation**: Use 10 rounds (default), not 12+

#### Risk 2: Rate Limiting Blocks Legitimate Users
**Severity**: MEDIUM
**Impact**: User locked out after 5 failed logins
**Mitigation**:
- Increase limit to 10 attempts
- Implement IP-based blocking + CAPTCHA after 3 failures
- Add "Forgot Password" flow

#### Risk 3: CSP Blocks Stripe Elements
**Severity**: MEDIUM
**Impact**: Stripe payment form won't load
**Mitigation**:
- Add Stripe domains to CSP:
```typescript
contentSecurityPolicy: {
  directives: {
    scriptSrc: ["'self'", "https://js.stripe.com"],
    frameSrc: ["'self'", "https://js.stripe.com"],
    connectSrc: ["'self'", "https://api.stripe.com"],
  }
}
```

---

## Cross-Goal Dependencies & Integration Points

### Dependency Graph

```
Goal 2 (PostgreSQL) is FOUNDATIONAL for:
├─ Goal 1 (Checkout) - Order persistence requires DB
└─ Goal 3 (Admin Orders) - Can't manage orders in localStorage

Goal 1 (Checkout) enables:
└─ Goal 3 (Admin Orders) - Need orders to manage

Goal 5 (Security) should be done BEFORE:
└─ Production deployment of ANY feature

Parallel tracks (can work simultaneously):
├─ Goal 4 (UX) - Independent of backend changes
└─ Goal 5 (Security) - Can add middleware while features develop
```

### Recommended Implementation Order

**CRITICAL PATH**:

```
Week 1-2: Foundation
├─ Goal 5 (Security) - Phase 1: bcrypt hashing
├─ Goal 2 (PostgreSQL) - Phase 1-2: Setup DB + Auth/Product repos
└─ Goal 4 (UX) - Phase 1: Responsive design

Week 3-4: Core Features
├─ Goal 2 (PostgreSQL) - Phase 3: Complete all repos
├─ Goal 1 (Checkout) - Phase 1-2: Stripe integration
└─ Goal 4 (UX) - Phase 2-3: Loading states + validation

Week 5-6: Admin & Polish
├─ Goal 1 (Checkout) - Phase 3: Testing + webhooks
├─ Goal 3 (Admin) - All phases
└─ Goal 5 (Security) - Phase 2-4: Rate limiting + headers + validation

Week 7: Integration Testing & Deployment
├─ End-to-end testing of full checkout flow
├─ Security audit
└─ Production deployment prep
```

---

## Proposed Phase 3 Folder/File Changes

### New Files to Create

#### Backend

```
backend/
├── src/
│   ├── domain/
│   │   ├── orders/                          ⭐ NEW DOMAIN
│   │   │   ├── order.types.ts               ⭐ Order, OrderItem, IOrderRepository
│   │   │   ├── order.service.ts             ⭐ Business logic + Stripe integration
│   │   │   ├── order.controller.ts          ⭐ HTTP handlers
│   │   │   ├── order.router.ts              ⭐ Route definitions
│   │   │   └── order.schemas.ts             ⭐ Zod validation schemas
│   │   │
│   │   └── auth/
│   │       └── auth.schemas.ts              ⭐ NEW - Zod schemas (login, register, password)
│   │
│   ├── infra/
│   │   ├── demo/
│   │   │   └── demo-order.store.ts          ⭐ NEW - File-based order storage
│   │   │
│   │   └── postgres/                        ⭐ NEW DIRECTORY
│   │       ├── prisma-client.ts             ⭐ Singleton PrismaClient
│   │       ├── postgres-auth.repository.ts  ⭐ PostgreSQL auth implementation
│   │       ├── postgres-product.repository.ts ⭐ PostgreSQL product implementation
│   │       ├── postgres-cart.repository.ts  ⭐ PostgreSQL cart implementation
│   │       └── postgres-order.repository.ts ⭐ PostgreSQL order implementation
│   │
│   └── middleware/
│       └── security.middleware.ts           ⭐ NEW - Rate limiting, helmet, sanitization
│
├── prisma/                                   ⭐ NEW DIRECTORY
│   ├── schema.prisma                        ⭐ Database schema definition
│   └── migrations/                          ⭐ Auto-generated by Prisma
│       └── 20250101_init/
│           └── migration.sql
│
├── scripts/                                  ⭐ NEW DIRECTORY
│   └── migrate-demo-to-postgres.ts          ⭐ Data migration script
│
└── data/
    └── demo-orders.json                     ⭐ NEW - Demo order storage
```

#### Frontend

```
frontend/src/app/
├── components/
│   ├── checkout/
│   │   ├── checkout.ts                      ✏️ MODIFY - Add Stripe Elements + shipping form
│   │   ├── checkout.html                    ✏️ MODIFY - Add form UI + Stripe container
│   │   └── checkout.css                     ✏️ MODIFY - Style enhancements
│   │
│   ├── order-confirmation/                  ⭐ NEW COMPONENT
│   │   ├── order-confirmation.ts            ⭐ Post-checkout success page
│   │   ├── order-confirmation.html          ⭐ Order summary display
│   │   └── order-confirmation.css           ⭐ Styles
│   │
│   └── admin/
│       ├── admin-panel/
│       │   ├── admin-panel.ts               ✏️ MODIFY - Add Orders/Sales tabs
│       │   ├── admin-panel.html             ✏️ MODIFY - Add tab content
│       │   └── admin-panel.css              ✏️ MODIFY - Style new tabs
│       │
│       └── user-editor-modal/               ⭐ NEW COMPONENT
│           ├── user-editor-modal.ts         ⭐ Edit user details modal
│           ├── user-editor-modal.html       ⭐ Form UI
│           └── user-editor-modal.css        ⭐ Styles
│
├── shared/                                   ⭐ NEW DIRECTORY
│   └── skeleton/                            ⭐ NEW - Loading skeletons
│       ├── skeleton-product-card.ts         ⭐ Product card skeleton
│       ├── skeleton-user-card.ts            ⭐ User card skeleton
│       └── skeleton.css                     ⭐ Skeleton animations
│
├── services/
│   ├── order.service.ts                     ⭐ NEW - Order API calls
│   └── admin.service.ts                     ✏️ MODIFY - Add order/analytics methods
│
├── features/
│   └── orders/                              ⭐ NEW FEATURE (OPTIONAL)
│       ├── order.store.ts                   ⭐ Signal-based order state
│       ├── order.api.ts                     ⭐ HTTP calls
│       └── order.types.ts                   ⭐ Order types (aligned with backend)
│
├── app.ts                                    ✏️ MODIFY - Add mobile menu state
├── app.html                                  ✏️ MODIFY - Add mobile navigation
├── app.css                                   ✏️ MODIFY - Responsive breakpoints
├── app.routes.ts                             ✏️ MODIFY - Add order-confirmation route
│
└── styles/
    └── forms.css                            ⭐ NEW - Global form styles
```

### Files to Modify

#### Backend

1. `backend/package.json` - Add dependencies: `stripe`, `@prisma/client`, `prisma`, `bcrypt`, `helmet`, `express-rate-limit`, `xss-clean`
2. `backend/.env.example` - Add: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, rate limit configs
3. `backend/src/app.ts` - Add security middleware, database connection, conditional DI
4. `backend/src/domain/auth/auth.service.ts` - Add bcrypt logic
5. `backend/routes/demo/admin.js` - Add order/analytics/user-edit endpoints

#### Frontend

1. `frontend/package.json` - Add: `@stripe/stripe-js`
2. `frontend/src/app/components/checkout/checkout.ts` - Stripe integration
3. `frontend/src/app/components/checkout/checkout.html` - Shipping form + Stripe Elements
4. `frontend/src/app/components/admin/admin-panel/admin-panel.ts` - Orders/Sales tabs
5. `frontend/src/app/components/admin/admin-panel/admin-panel.html` - New tab content
6. `frontend/src/app/components/products/products.html` - Skeleton loaders
7. `frontend/src/app/components/products/products.css` - Responsive grid
8. `frontend/src/app/components/account/login/login.ts` - Enhanced validation
9. `frontend/src/app/components/account/login/login.html` - Error display + disabled states

---

## Summary & Recommendations

### Key Findings

1. **✅ Architecture is Production-Ready**: Your repository pattern and DDD structure perfectly support all Phase 3 goals.

2. **✅ 80% Foundation Complete**: Most infrastructure exists—you're adding features, not rebuilding.

3. **⚠️ Critical Dependency**: PostgreSQL migration must complete before production deployment. Demo mode is not production-safe (plain-text passwords, in-memory carts).

4. **⚠️ Security Gap**: bcrypt hashing is CRITICAL and should be first priority for production mode.

5. **✅ Clean Separation**: Frontend/backend separation means UX work can happen in parallel with backend features.

### Prioritized Action Plan

**Week 1: Security Foundation**
- Implement bcrypt hashing
- Add rate limiting to login endpoints
- Set up PostgreSQL locally

**Week 2: Database Migration**
- Create Prisma schema
- Implement PostgreSQL repositories
- Test repository swap

**Week 3: Checkout Integration**
- Integrate Stripe (test mode)
- Build shipping address form
- Create payment intent endpoint

**Week 4: Checkout Completion**
- Implement webhook handler
- Create order confirmation page
- End-to-end testing

**Week 5: Admin Expansion**
- Add Orders tab
- Add Sales analytics placeholder
- User editing capabilities

**Week 6: UX Polish**
- Responsive design (mobile nav)
- Loading skeletons
- Form validation enhancements

**Week 7: Security Hardening**
- Helmet security headers
- Comprehensive validation schemas
- Security testing

**Week 8: Integration & Deployment**
- Full system testing
- Production database setup
- Deployment

### Success Metrics

After Phase 3 completion, you will have:

- ✅ Functional Stripe checkout (test mode)
- ✅ PostgreSQL database with all domains migrated
- ✅ bcrypt-hashed passwords
- ✅ Admin order management
- ✅ Mobile-responsive design
- ✅ Rate-limited API endpoints
- ✅ Security headers enabled
- ✅ Comprehensive input validation

### Final Validation

**Your Phase 3 goals are:**
1. ✅ **Achievable** - All goals have clear implementation paths
2. ✅ **Well-Scoped** - 6-8 weeks of work is realistic
3. ✅ **Architecturally Sound** - No major refactoring required
4. ✅ **Properly Sequenced** - Dependencies identified and ordered
5. ✅ **Production-Focused** - Addresses real deployment needs

**Recommendation**: Proceed with confidence. Your architecture will support these goals cleanly.

---

**Report End**
Generated: 2025-12-01
Next Action: Review this report → Prioritize goals → Begin Week 1 implementation
