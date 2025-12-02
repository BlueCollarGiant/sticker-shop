# Phase 3 - PostgreSQL Migration (Corrected Architecture)

## Architecture Clarification

**CRITICAL**: This project does NOT have a backend "demo mode" toggle.

### What Actually Exists

1. **Backend Persistence**: ONE active repository implementation at a time
   - **Current (Today)**: Seed-file repositories (`DemoAuthStore`, `DemoProductStore`)
   - **Future (Phase 3)**: PostgreSQL repositories (`PostgresAuthRepository`, `PostgresProductRepository`)
   - **Migration**: Manual code change in DI, not runtime toggle

2. **Frontend Demo Login**: UI convenience only
   - Two buttons that auto-fill hardcoded credentials
   - No backend behavior changes
   - Just saves typing for demo purposes

### What Does NOT Exist

❌ **NO** `DEMO_MODE` environment variable for backend storage switching
❌ **NO** runtime repository toggling
❌ **NO** dual-mode backend architecture
❌ **NO** feature flags for persistence layer

---

## Current State (Before Phase 3)

### Backend Repositories (Active)

```
backend/src/infra/demo/
├── demo-auth.store.ts      ✅ ACTIVE - File-based user storage
└── demo-product.store.ts   ✅ ACTIVE - File-based product storage
```

### Dependency Injection (Current)

**`auth.router.ts`**:
```typescript
// Current implementation (hardcoded to demo stores)
const authStore = new DemoAuthStore();
const authService = new AuthService(authStore);
```

**`product.router.ts`**:
```typescript
// Current implementation (hardcoded to demo stores)
const productStore = new DemoProductStore();
const productService = new ProductService(productStore);
```

---

## Phase 3 Goal: Add PostgreSQL Infrastructure (Not Yet Active)

### Objective

Create PostgreSQL repository implementations alongside the existing seed-file repos, but **DO NOT wire them up yet**. They will exist in the codebase as preparation for manual migration later.

### What We're Building

1. ✅ Prisma schema for PostgreSQL
2. ✅ PostgreSQL repository implementations
3. ✅ Database connection utilities
4. ❌ **NOT** wiring to DI (stays on seed-file repos)
5. ❌ **NOT** creating mode toggles
6. ❌ **NOT** changing active persistence

---

## Implementation Steps

### Step 1: Add Prisma Dependencies

**File: `backend/package.json`**

Add to `dependencies`:
```json
"@prisma/client": "^5.8.0"
```

Add to `devDependencies`:
```json
"prisma": "^5.8.0"
```

**Commands**:
```bash
cd backend
npm install
```

---

### Step 2: Create Prisma Schema

**File: `backend/prisma/schema.prisma`** (NEW)

```prisma
// Prisma Schema for Night Reader Sticker Shop
// Database: PostgreSQL

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User model
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  role         String   @default("user")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

// Product model
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

  images ProductImage[]

  @@map("products")
}

// Product images (separate table for normalization)
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
```

**Commands**:
```bash
npx prisma generate
```

---

### Step 3: Create Database Connection Utility

**File: `backend/src/infra/postgres/prisma-client.ts`** (NEW)

```typescript
/**
 * Prisma Client Singleton
 * Manages database connection for PostgreSQL
 *
 * NOTE: This is NOT yet wired to the application.
 * It will be used when we manually migrate from seed-file repos.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Connect to the database
 * Call this manually when ready to switch to PostgreSQL
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from the database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
}

/**
 * Graceful shutdown handlers
 */
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
```

---

### Step 4: Implement PostgresAuthRepository

**File: `backend/src/infra/postgres/postgres-auth.repository.ts`** (NEW)

```typescript
/**
 * PostgreSQL Auth Repository
 * Implements IAuthRepository using Prisma + PostgreSQL
 *
 * NOTE: This is NOT yet active in the application.
 * Currently, DemoAuthStore is used. This repo will be manually
 * wired in when we're ready to migrate.
 */

import { prisma } from './prisma-client';
import { IAuthRepository, User, RegisterUserInput } from '../../domain/auth/auth.types';

export class PostgresAuthRepository implements IAuthRepository {
  /**
   * Find user by email address
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToUser(user);
  }

  /**
   * Create a new user
   * NOTE: Using plain-text password for now to match current demo behavior
   * bcrypt hashing will be added in Phase 3 Step 2 (Security)
   */
  async createUser(input: RegisterUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.password, // Plain-text for now
        name: input.name,
        role: 'user',
      },
    });

    return this.mapToUser(user);
  }

  /**
   * Get user with password (for authentication)
   */
  async getUserWithPassword(email: string): Promise<(User & { password: string }) | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      password: user.passwordHash,
    };
  }

  /**
   * Map Prisma User model to domain User type
   */
  private mapToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as 'user' | 'admin',
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}
```

---

### Step 5: Implement PostgresProductRepository

**File: `backend/src/infra/postgres/postgres-product.repository.ts`** (NEW)

```typescript
/**
 * PostgreSQL Product Repository
 * Implements IProductRepository using Prisma + PostgreSQL
 *
 * NOTE: This is NOT yet active in the application.
 * Currently, DemoProductStore is used. This repo will be manually
 * wired in when we're ready to migrate.
 */

import { prisma } from './prisma-client';
import {
  IProductRepository,
  Product,
  ProductListResult,
  CreateProductInput,
  UpdateProductInput,
  ProductCatalog,
  ProductBadge,
} from '../../domain/products/product.types';

export class PostgresProductRepository implements IProductRepository {
  /**
   * Get all products with pagination support
   */
  async getAll(): Promise<ProductListResult> {
    const products = await prisma.product.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedProducts = products.map(this.mapToProduct);

    return {
      data: mappedProducts,
      total: mappedProducts.length,
      page: 1,
      limit: mappedProducts.length,
    };
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    return this.mapToProduct(product);
  }

  /**
   * Create a new product
   */
  async create(input: CreateProductInput): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice,
        category: input.category,
        collection: input.collection,
        tags: input.tags,
        badges: input.badges,
        rating: input.rating,
        reviewCount: input.reviewCount,
        isNew: input.isNew,
        isBestseller: input.isBestseller,
        isLimitedEdition: input.isLimitedEdition,
        stock: input.stock,
        images: {
          create: input.images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            order: img.order ?? index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Update an existing product
   */
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const updateData: any = {
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      price: input.price,
      salePrice: input.salePrice,
      category: input.category,
      collection: input.collection,
      tags: input.tags,
      badges: input.badges,
      rating: input.rating,
      reviewCount: input.reviewCount,
      isNew: input.isNew,
      isBestseller: input.isBestseller,
      isLimitedEdition: input.isLimitedEdition,
      stock: input.stock,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle image updates if provided
    if (input.images) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      updateData.images = {
        create: input.images.map((img, index) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          order: img.order ?? index,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Product ${id} deleted successfully`,
    };
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, stock: number): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: { stock },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Toggle product badge (add if missing, remove if present)
   */
  async toggleBadge(id: string, badge: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    const badges = product.badges;
    const badgeIndex = badges.indexOf(badge);

    let updatedBadges: string[];
    if (badgeIndex > -1) {
      updatedBadges = badges.filter((b) => b !== badge);
    } else {
      updatedBadges = [...badges, badge];
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { badges: updatedBadges },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(updatedProduct);
  }

  /**
   * Get catalog metadata
   */
  async getCatalog(): Promise<ProductCatalog> {
    const products = await prisma.product.findMany({
      select: {
        category: true,
        collection: true,
      },
    });

    const categories = [...new Set(products.map((p) => p.category))];
    const collections = [...new Set(products.map((p) => p.collection))];

    return {
      categories,
      collections,
      totalProducts: products.length,
    };
  }

  /**
   * Map Prisma Product model to domain Product type
   */
  private mapToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      subtitle: dbProduct.subtitle,
      description: dbProduct.description,
      price: parseFloat(dbProduct.price.toString()),
      salePrice: dbProduct.salePrice ? parseFloat(dbProduct.salePrice.toString()) : undefined,
      category: dbProduct.category,
      collection: dbProduct.collection,
      images: dbProduct.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        isPrimary: img.isPrimary,
        order: img.order,
      })),
      tags: dbProduct.tags,
      badges: dbProduct.badges as ProductBadge[],
      rating: parseFloat(dbProduct.rating.toString()),
      reviewCount: dbProduct.reviewCount,
      isNew: dbProduct.isNew,
      isBestseller: dbProduct.isBestseller,
      isLimitedEdition: dbProduct.isLimitedEdition,
      stock: dbProduct.stock,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}
```

---

### Step 6: Add DATABASE_URL to .env.example

**File: `backend/.env.example`** (MODIFY)

Add this section:

```bash
# Database (PostgreSQL)
# Only needed when manually migrating to PostgreSQL repositories
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://postgres:password@localhost:5432/nightreader_db
```

**DO NOT MODIFY**:
- Keep existing `DEMO_MODE` (it's for Printify toggle, unrelated to this)
- Keep all other existing vars

---

## What Changes (And What Doesn't)

### ✅ Changes Made

1. **`backend/package.json`**: Added Prisma dependencies
2. **`backend/prisma/schema.prisma`**: Created (NEW file)
3. **`backend/src/infra/postgres/prisma-client.ts`**: Created (NEW file)
4. **`backend/src/infra/postgres/postgres-auth.repository.ts`**: Created (NEW file)
5. **`backend/src/infra/postgres/postgres-product.repository.ts`**: Created (NEW file)
6. **`backend/.env.example`**: Added `DATABASE_URL`

### ❌ NO Changes to Active Code

1. **`auth.router.ts`**: Still uses `DemoAuthStore` (unchanged)
2. **`product.router.ts`**: Still uses `DemoProductStore` (unchanged)
3. **`app.ts`**: No database connection called (unchanged)
4. **`server.ts`**: Still uses seed-file logic (unchanged)
5. **All services, controllers, middleware**: Completely unchanged

### Current Behavior (Identical to Before)

- ✅ Server starts with seed-file repositories
- ✅ Auto-seeding from JSON files works
- ✅ All endpoints function identically
- ✅ NO PostgreSQL connection attempted
- ✅ NO database required to run

---

## Commands to Run (In Order)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Verify TypeScript Compilation
```bash
npm run build
```

### 4. Start Server (Should Work Identically)
```bash
npm run dev
```

Expected output:
```
[SEED] Loaded 2 users, 20 products
🚀 Night Reader Shop - Backend running on port 3000
```

---

## Future Migration (Manual Steps - Not Done Now)

When you're ready to switch from seed-file repos to PostgreSQL repos:

### Step 1: Set Up PostgreSQL
```bash
docker run --name nightreader-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nightreader_db \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Run Migrations
```bash
npx prisma migrate dev --name init
```

### Step 3: Seed PostgreSQL (Manual Script - To Be Created)
```bash
# Create a script to import demo-users.json and demo-products.json
# into PostgreSQL
```

### Step 4: Update DI Manually

**`backend/src/domain/auth/auth.router.ts`**:
```typescript
// Change from:
const authStore = new DemoAuthStore();

// To:
import { PostgresAuthRepository } from '../../infra/postgres/postgres-auth.repository';
const authStore = new PostgresAuthRepository();
```

**`backend/src/domain/products/product.router.ts`**:
```typescript
// Change from:
const productStore = new DemoProductStore();

// To:
import { PostgresProductRepository } from '../../infra/postgres/postgres-product.repository';
const productStore = new PostgresProductRepository();
```

**`backend/src/app.ts`**:
```typescript
// Add at the top of createApp():
import { connectDatabase } from './infra/postgres/prisma-client';

export async function createApp(): Promise<Express> {
  const app = express();

  await connectDatabase(); // Add this line

  // ... rest of app setup
}
```

**`backend/src/server.ts`**:
```typescript
// Change createApp() call from:
const app = createApp();

// To:
const app = await createApp();
```

---

## File Structure Summary

```
backend/
├── prisma/
│   └── schema.prisma                        ⭐ NEW - DB schema
│
├── src/
│   ├── infra/
│   │   ├── demo/                            ✅ ACTIVE (unchanged)
│   │   │   ├── demo-auth.store.ts
│   │   │   └── demo-product.store.ts
│   │   │
│   │   └── postgres/                        ⭐ NEW DIRECTORY (not active yet)
│   │       ├── prisma-client.ts             ⭐ NEW - DB utilities
│   │       ├── postgres-auth.repository.ts  ⭐ NEW - Auth repo
│   │       └── postgres-product.repository.ts ⭐ NEW - Product repo
│   │
│   ├── domain/
│   │   ├── auth/
│   │   │   └── auth.router.ts               ✅ UNCHANGED - Uses DemoAuthStore
│   │   │
│   │   └── products/
│   │       └── product.router.ts            ✅ UNCHANGED - Uses DemoProductStore
│   │
│   ├── app.ts                               ✅ UNCHANGED
│   ├── server.ts                            ✅ UNCHANGED
│   └── config/
│       └── env.ts                           ✅ UNCHANGED
│
├── package.json                             ✏️ MODIFIED - Added Prisma deps
└── .env.example                             ✏️ MODIFIED - Added DATABASE_URL
```

---

## Verification Checklist

- [ ] `npm install` completes without errors
- [ ] `npx prisma generate` creates Prisma client
- [ ] `npm run build` compiles TypeScript successfully
- [ ] `npm run dev` starts server normally
- [ ] Server logs show seed-file loading (not database connection)
- [ ] All existing endpoints work identically
- [ ] NO PostgreSQL connection attempted
- [ ] PostgreSQL repos exist in codebase but are not used

---

## Key Points

1. **PostgreSQL infrastructure is prepared, not activated**
2. **Seed-file repositories remain the only active persistence**
3. **No runtime mode switching - manual code change when ready**
4. **Frontend demo login buttons are unrelated to backend persistence**
5. **This is a preparation step, not a migration step**

---

**STATUS**: PostgreSQL skeleton ready for future manual migration
**NEXT STEP**: When ready, manually update DI in routers to use PostgreSQL repos
