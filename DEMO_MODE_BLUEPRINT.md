# Night Reader Shop – Demo Mode Architecture Blueprint

## 🎯 Executive Summary

Night Reader Shop is a full-stack e-commerce portfolio project showcasing modern web development practices. This blueprint outlines a **temporary demo mode architecture** that maintains production-quality code while using mock data for portfolio demonstration purposes.

**Timeline:** Complete before December 2nd, 2024
**Mode:** Demo Mode (Real API integrations disabled)
**Tech Stack:** Angular 19 + Node.js/Express + TypeScript
**Future State:** Printify API + Bookshop integration ready to enable post-demo

---

## 🏗️ System Architecture Overview

### Demo Mode vs. Production Mode

The architecture is designed with a clean separation between demo and production modes, controlled by a single environment flag.

```
┌─────────────────────────────────────────────────────────────┐
│                        DEMO MODE                             │
│  Frontend → Express API → Mock Data Service → JSON Response │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION MODE                          │
│  Frontend → Express API → Printify Service → Printify API   │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Zero Hardcoded Data in Frontend** - All data flows through HTTP calls
2. **Consistent Data Shape** - Mock data matches production Product model exactly
3. **Graceful Mode Switching** - Single flag toggles between demo and production
4. **Feature Parity** - Demo mode supports all UI features (filtering, sorting, cart, etc.)
5. **Real Authentication** - Full auth system with User/Admin roles
6. **Admin Panel** - Demo CRUD operations for portfolio demonstration

---

## 📁 Backend Structure

### Folder Organization

```
backend/
├── server.js                    # Main Express server
├── .env                         # Environment configuration
├── config/
│   └── demo-mode.js            # DEMO_MODE flag and config
├── services/
│   ├── printify.js             # Real Printify API (disabled in demo)
│   ├── mock-data.service.js    # Demo data provider
│   └── auth.service.js         # Authentication logic
├── routes/
│   ├── products.js             # Product routes (mode-aware)
│   ├── demo/
│   │   ├── products.js         # Demo product endpoints
│   │   └── admin.js            # Demo admin CRUD endpoints
│   ├── auth.js                 # Auth endpoints
│   └── orders.js               # Order routes
├── middleware/
│   ├── auth.middleware.js      # JWT validation
│   └── role.middleware.js      # Role-based access control
├── data/
│   └── demo-products.json      # In-memory demo product data
└── package.json
```

### Demo Mode Configuration

**File:** `config/demo-mode.js`

```javascript
module.exports = {
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  PRINTIFY_ENABLED: process.env.DEMO_MODE !== 'true',
  ADMIN_DEMO_ENABLED: process.env.DEMO_MODE === 'true'
};
```

**Environment Variables:**

```
DEMO_MODE=true
PORT=3000
JWT_SECRET=your_jwt_secret_here
PRINTIFY_API_KEY=disabled_in_demo
PRINTIFY_SHOP_ID=disabled_in_demo
```

### Route Architecture

#### Product Routes (`routes/products.js`)

Mode-aware routing that delegates to either Printify service or mock data service:

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/catalog` - Get product catalog/categories

Logic flow:
```
Request → Check DEMO_MODE flag →
  If true: Call mockDataService
  If false: Call printifyService
→ Return unified response
```

#### Demo Admin Routes (`routes/demo/admin.js`)

**Protected by Admin role middleware**

- `GET /api/demo/admin/products` - List all demo products (with edit metadata)
- `POST /api/demo/admin/products` - Create new demo product
- `PUT /api/demo/admin/products/:id` - Update demo product
- `DELETE /api/demo/admin/products/:id` - Delete demo product
- `PATCH /api/demo/admin/products/:id/stock` - Update stock level
- `PATCH /api/demo/admin/products/:id/badges` - Toggle badges (new/bestseller/limited)

#### Auth Routes (`routes/auth.js`)

- `POST /api/auth/register` - Register new user (demo credentials)
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/demo-login` - Quick demo login (pre-configured accounts)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

**Demo Accounts:**
- User: `demo@nightreader.com` / `demo123`
- Admin: `admin@nightreader.com` / `admin123`

### Mock Data Service

**File:** `services/mock-data.service.js`

In-memory data store that mimics database operations:

- `getAll()` - Returns all products
- `getById(id)` - Returns single product
- `create(productData)` - Adds new product
- `update(id, productData)` - Updates product
- `delete(id)` - Removes product
- `updateStock(id, stock)` - Updates stock level
- `toggleBadge(id, badge)` - Toggles product badge

Data persists only during server runtime (resets on restart).

### Authentication Middleware

**File:** `middleware/auth.middleware.js`

JWT-based authentication:
- Validates bearer tokens
- Attaches user object to request
- Returns 401 for invalid/missing tokens

**File:** `middleware/role.middleware.js`

Role-based access control:
- `requireUser()` - Requires any authenticated user
- `requireAdmin()` - Requires admin role
- Returns 403 for insufficient permissions

---

## 🎨 Frontend Structure

### Folder Organization

```
frontend/src/app/
├── components/
│   ├── products/
│   │   ├── products.ts          # Product list with filters
│   │   ├── products.html
│   │   └── products.css
│   ├── product-detail/
│   │   ├── product-detail.ts    # Single product view (TO BUILD)
│   │   ├── product-detail.html
│   │   └── product-detail.css
│   ├── cart/
│   │   └── ...                  # Existing cart components
│   ├── auth/
│   │   ├── login/               # Login component
│   │   └── demo-login/          # Quick demo login buttons
│   └── admin/
│       ├── admin-panel.ts       # Admin dashboard (TO BUILD)
│       ├── product-editor/      # Product CRUD interface
│       └── stock-manager/       # Stock management interface
├── services/
│   ├── products.ts              # HTTP product service
│   ├── auth.service.ts          # Authentication service (TO BUILD)
│   ├── cart.service.ts          # Existing cart service
│   └── admin.service.ts         # Admin API calls (TO BUILD)
├── models/
│   ├── product.model.ts         # Complete product interface (KEEP AS-IS)
│   ├── user.model.ts            # User interface (TO BUILD)
│   └── auth.model.ts            # Auth tokens/responses (TO BUILD)
├── guards/
│   ├── auth.guard.ts            # Route protection (TO BUILD)
│   └── admin.guard.ts           # Admin route protection (TO BUILD)
└── interceptors/
    └── auth.interceptor.ts      # JWT token injection (TO BUILD)
```

### Service Layer Architecture

#### ProductsService (`services/products.ts`)

**Current State:** Has HTTP methods defined
**Required Update:** Already functional, just needs backend to return data

Methods:
- `getProducts(): Observable<Product[]>`
- `getProduct(id: string): Observable<Product>`
- `getCatalog(): Observable<any>`

#### AuthService (`services/auth.service.ts`) - TO BUILD

Methods:
- `login(email: string, password: string): Observable<AuthResponse>`
- `demoLogin(role: 'user' | 'admin'): Observable<AuthResponse>`
- `register(userData): Observable<AuthResponse>`
- `logout(): void`
- `getCurrentUser(): Observable<User>`
- `isAuthenticated(): boolean`
- `isAdmin(): boolean`
- `getToken(): string | null`

State management:
- Store JWT token in localStorage
- Expose current user as Signal or BehaviorSubject
- Auto-refresh token on app load

#### AdminService (`services/admin.service.ts`) - TO BUILD

Methods:
- `getAllProducts(): Observable<Product[]>`
- `createProduct(product: Product): Observable<Product>`
- `updateProduct(id: string, product: Partial<Product>): Observable<Product>`
- `deleteProduct(id: string): Observable<void>`
- `updateStock(id: string, stock: number): Observable<Product>`
- `toggleBadge(id: string, badge: ProductBadge): Observable<Product>`

### Component Architecture

#### Products Component (`components/products/products.ts`)

**Current State:** Uses hardcoded `MOCK_PRODUCTS`
**Required Update:** Replace with service call

```typescript
// BEFORE (Current)
allProducts = signal<Product[]>(MOCK_PRODUCTS);

// AFTER (Demo Mode)
constructor(private productsService: ProductsService) {
  this.loadProducts();
}

loadProducts() {
  this.productsService.getProducts().subscribe(products => {
    this.allProducts.set(products);
  });
}
```

**Features to Keep:**
- Filtering by category/collection
- Price range filtering
- Sorting options
- "Add to Cart" functionality
- Badge display

#### Product Detail Component - TO BUILD

**Route:** `/products/:id`

**Features:**
- Fetch product by ID from API
- Display all images in a gallery slider
- Show variants (size/color) as selectable options
- Display price (with sale price if applicable)
- Show stock availability
- Variant-specific stock display
- "Add to Cart" with variant selection
- Related products section
- Rating and review count display
- Tags display
- Breadcrumb navigation

**Layout Sections:**
1. Image gallery (left) - Primary image + thumbnails
2. Product info (right) - Title, subtitle, price, badges
3. Variant selector - Size/color buttons
4. Stock indicator - "In Stock" / "Low Stock" / "Out of Stock"
5. Add to Cart button (disabled if out of stock)
6. Product description - Full text with formatting
7. Product tags - Clickable tag chips
8. Related products - 4-6 similar items

#### Admin Panel Component - TO BUILD

**Route:** `/admin` (protected by AdminGuard)

**Layout:**
- Dashboard overview (total products, low stock alerts)
- Product list table with quick actions
- Create/Edit product modal
- Stock management panel
- Badge toggle switches

**Features:**
- Table view of all products
- Search and filter
- Inline stock editing
- Quick badge toggles (New/Bestseller/Limited)
- Delete confirmation dialogs
- Product creation form with all fields
- Image URL input (can be placeholder URLs for demo)
- Real-time updates (optimistic UI updates)

#### Demo Login Component - TO BUILD

**Location:** Login page with quick access buttons

UI includes:
- Standard login form (email + password)
- "Demo as User" button (instant login)
- "Demo as Admin" button (instant login)
- Visual distinction (like Plumino project)
- Clear indication of demo credentials

---

## 📊 Data Schema

### Product Model (UNCHANGED)

**File:** `models/product.model.ts`

```typescript
interface Product {
  // Identity
  id: string;
  title: string;
  subtitle?: string;
  description: string;

  // Pricing
  price: number;
  salePrice?: number;

  // Categorization
  category: ProductCategory;        // STICKERS | APPAREL | MUGS | POSTERS | etc.
  collection: ProductCollection;    // DARK_ACADEMIA | MIDNIGHT_MINIMALIST | MYTHIC_FANTASY
  tags: string[];
  badges?: ProductBadge[];          // NEW | BESTSELLER | LIMITED | SALE

  // Media
  images: ProductImage[];           // Array with isPrimary flag

  // Variants
  variants: ProductVariant[];       // Size/color options with individual stock

  // Stock
  stock: number;                    // Main stock level

  // Social Proof
  rating: number;                   // 0-5 stars
  reviewCount: number;

  // Flags
  isNew: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;

  // Metadata
  createdAt: Date;
}
```

### Supporting Interfaces

**ProductImage:**
```typescript
{
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}
```

**ProductVariant:**
```typescript
{
  id: string;
  size?: string;          // "S" | "M" | "L" | "XL"
  color?: string;         // "Midnight Black"
  colorHex?: string;      // "#0A1628"
  price?: number;         // Override price if variant-specific
  stock: number;
  sku: string;
}
```

### User Model - TO BUILD

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

interface AuthResponse {
  token: string;
  user: User;
}
```

---

## 🎭 Mock API Data Structure

### Demo Products Endpoint

**GET** `/api/products`

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "Read by Moonlight",
      "subtitle": "Vinyl Sticker",
      "description": "A premium vinyl sticker featuring a crescent moon and open book design...",
      "price": 4.99,
      "salePrice": null,
      "category": "stickers",
      "collection": "dark-academia",
      "images": [
        {
          "id": "img1",
          "url": "https://placehold.co/600x600/1A1410/E8DCC4?text=Read+by+Moonlight",
          "alt": "Read by Moonlight Sticker",
          "isPrimary": true,
          "order": 1
        }
      ],
      "variants": [],
      "tags": ["reading", "moon", "literary"],
      "badges": ["bestseller"],
      "rating": 4.8,
      "reviewCount": 28,
      "isNew": false,
      "isBestseller": true,
      "isLimitedEdition": false,
      "stock": 150,
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

### Data Generation Strategy

**Use existing mock data from:** `frontend/src/app/services/shop/mock-products.ts`

**Migration Path:**
1. Copy MOCK_PRODUCTS array
2. Move to backend `data/demo-products.json`
3. Expand to 15-20 products for better demo experience
4. Use `placehold.co` or `via.placeholder.com` for consistent image styling
5. Ensure variety in categories, collections, badges, and stock levels

**Stock Variety:**
- High stock (100+): Bestsellers
- Medium stock (20-50): Regular items
- Low stock (1-10): Limited edition items
- Out of stock (0): 1-2 products to test UI handling

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
User clicks "Demo as Admin"
  → POST /api/auth/demo-login { role: 'admin' }
  → Backend generates JWT with role claim
  → Frontend stores token in localStorage
  → AuthInterceptor adds token to all requests
  → Protected routes check token validity
```

### JWT Token Structure

**Claims:**
```json
{
  "userId": "admin-1",
  "email": "admin@nightreader.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Expiry:** 24 hours (demo mode)

### Route Protection

**Frontend Guards:**

`AuthGuard` - Protects all authenticated routes:
- Checks for valid token
- Redirects to `/login` if missing/expired

`AdminGuard` - Protects admin routes:
- Extends AuthGuard
- Checks user role === 'admin'
- Redirects to `/` if insufficient permissions

**Protected Routes:**
- `/account` - User account (AuthGuard)
- `/orders` - User order history (AuthGuard)
- `/admin` - Admin panel (AdminGuard)
- `/admin/**` - All admin routes (AdminGuard)

### Demo Login UI

**Login Page Layout:**

```
┌─────────────────────────────────────┐
│        Night Reader Shop            │
│                                     │
│  [Email Input]                      │
│  [Password Input]                   │
│  [Login Button]                     │
│                                     │
│  ────────── OR ──────────           │
│                                     │
│  Quick Demo Access:                 │
│  [👤 Demo as User]                  │
│  [🔑 Demo as Admin]                 │
│                                     │
│  [Create Account]                   │
└─────────────────────────────────────┘
```

Demo buttons instantly log in without form validation.

---

## 🛠️ Admin Demo Panel Specification

### Dashboard Overview

**Route:** `/admin`

**Sections:**

1. **Stats Cards**
   - Total Products
   - Low Stock Alerts (stock < 10)
   - New Products (created in last 30 days)
   - Bestsellers Count

2. **Quick Actions**
   - Create New Product button
   - Bulk Stock Update
   - Export Product Data (JSON download)

3. **Product Management Table**

Columns:
- Thumbnail image
- Title / Category
- Price
- Stock (editable inline)
- Badges (toggle switches)
- Actions (Edit / Delete)

Features:
- Search by title
- Filter by category
- Filter by collection
- Sort by stock (asc/desc)
- Sort by price
- Pagination (10 items per page)

### Product Editor Modal

**Trigger:** "Create Product" or "Edit" button

**Form Fields:**

**Basic Info:**
- Title (required)
- Subtitle (optional)
- Description (textarea, required)

**Pricing:**
- Price (number, required)
- Sale Price (optional)

**Categorization:**
- Category (dropdown: STICKERS | APPAREL | MUGS | POSTERS | BOOKMARKS | PHONE_CASES)
- Collection (dropdown: DARK_ACADEMIA | MIDNIGHT_MINIMALIST | MYTHIC_FANTASY)
- Tags (multi-input chip field)

**Media:**
- Primary Image URL (text input)
- Additional Images (repeatable URL inputs)

**Variants:**
- Add Variant button
- For each variant:
  - Size (text input)
  - Color (text input)
  - Color Hex (color picker)
  - Price Override (number)
  - Stock (number)
  - SKU (auto-generated or manual)

**Stock & Flags:**
- Main Stock (number)
- Is New (checkbox)
- Is Bestseller (checkbox)
- Is Limited Edition (checkbox)

**Badges:**
- NEW (auto-set if isNew)
- BESTSELLER (auto-set if isBestseller)
- LIMITED (auto-set if isLimitedEdition)
- SALE (auto-set if salePrice exists)

**Actions:**
- Save Product
- Cancel (close modal)

### Inline Stock Editor

**Location:** Product table row

**Behavior:**
- Click stock number to edit
- Input field appears
- Enter new value
- Press Enter or blur → PATCH request updates backend
- Success: Show green checkmark animation
- Error: Revert to previous value, show error toast

### Badge Toggle Switches

**Location:** Product table row

**Badges:** NEW | BESTSELLER | LIMITED

**Behavior:**
- Toggle switch for each badge
- Instant UI update (optimistic)
- PATCH request to `/api/demo/admin/products/:id/badges`
- If request fails, revert toggle state
- SALE badge is read-only (auto-computed from salePrice)

### Delete Confirmation

**Trigger:** Delete button click

**Dialog:**
```
⚠️ Delete Product?

Are you sure you want to delete "Product Name"?
This action cannot be undone.

[Cancel]  [Delete]
```

**Behavior:**
- DELETE request on confirm
- Remove from table on success
- Show success toast
- Update stats cards

---

## 🔄 Future Integration Strategy

### Printify API Integration (Post-Demo)

**When to Enable:**
After December 2nd interview, when transitioning to production.

**Steps to Re-Enable:**

1. **Environment Configuration**
   ```
   DEMO_MODE=false
   PRINTIFY_API_KEY=<real_api_key>
   PRINTIFY_SHOP_ID=<real_shop_id>
   ```

2. **Backend Changes**
   - `routes/products.js` automatically routes to `printifyService` when `DEMO_MODE=false`
   - Implement data transformer: Printify response → Product model
   - Add mapping config for categories/collections/badges (Printify doesn't provide these)

3. **Data Mapping Layer**
   Create `services/product-mapper.service.js`:
   - Transform Printify API structure to Product model
   - Merge with local metadata (categories, collections, ratings)
   - Handle missing fields with defaults

4. **Frontend Changes**
   - **No changes required** - Already using ProductsService with HTTP calls
   - Admin panel routes to Printify endpoints instead of demo endpoints

5. **Database Integration**
   Add PostgreSQL/MongoDB for:
   - Product metadata (categories, collections, badges, ratings)
   - User accounts (real registration)
   - Order history
   - Reviews

### Bookshop Integration (Future Feature)

**Purpose:** Separate "Books" section with ISBN-based product data

**When to Add:**
After Printify integration is stable.

**Architecture:**
- New route: `/api/books`
- New service: `services/bookshop.service.js`
- New model: `Book` (extends Product or separate interface)
- New frontend component: `components/books/`

**Data Structure:**
```typescript
interface Book extends Product {
  isbn: string;
  author: string;
  publisher: string;
  pages: number;
  publicationDate: Date;
  format: 'hardcover' | 'paperback' | 'ebook';
}
```

**API Integration:**
- Use OpenLibrary API or Google Books API for book metadata
- Bookshop.org affiliate links for purchases
- Local stock tracking for physical inventory

---

## ✅ Development Checklist

### Phase 1: Backend Foundation (Days 1-3)

- [ ] Create `config/demo-mode.js` with DEMO_MODE flag
- [ ] Move mock products to `data/demo-products.json`
- [ ] Build `services/mock-data.service.js` with CRUD operations
- [ ] Update `routes/products.js` to be mode-aware
- [ ] Create `routes/demo/admin.js` with admin endpoints
- [ ] Create `routes/auth.js` with demo login endpoints
- [ ] Build `services/auth.service.js` with JWT generation
- [ ] Build `middleware/auth.middleware.js` for JWT validation
- [ ] Build `middleware/role.middleware.js` for role checks
- [ ] Update `server.js` to use new routes
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Expand demo products to 15-20 items with variety

### Phase 2: Frontend Auth (Days 4-5)

- [ ] Create `models/user.model.ts` and `auth.model.ts`
- [ ] Build `services/auth.service.ts` with login/logout methods
- [ ] Build `interceptors/auth.interceptor.ts` for token injection
- [ ] Create `guards/auth.guard.ts` for route protection
- [ ] Create `guards/admin.guard.ts` for admin routes
- [ ] Build `components/auth/login` component
- [ ] Build `components/auth/demo-login` with quick access buttons
- [ ] Add login/logout to navigation
- [ ] Test protected routes and redirects

### Phase 3: Products Integration (Days 6-7)

- [ ] Update `components/products/products.ts` to use ProductsService
- [ ] Remove hardcoded MOCK_PRODUCTS import
- [ ] Add loading state to products list
- [ ] Add error handling for API failures
- [ ] Test filtering, sorting, and cart functionality
- [ ] Verify all existing features still work

### Phase 4: Product Detail Page (Days 8-9)

- [ ] Build `components/product-detail/product-detail.ts` structure
- [ ] Implement image gallery with thumbnails
- [ ] Add variant selector (size/color buttons)
- [ ] Display stock availability
- [ ] Implement "Add to Cart" with variant selection
- [ ] Build related products section
- [ ] Add breadcrumb navigation
- [ ] Style with existing design system
- [ ] Test routing from products list
- [ ] Test with products that have/don't have variants

### Phase 5: Admin Panel (Days 10-12)

- [ ] Build `services/admin.service.ts` with CRUD methods
- [ ] Create `components/admin/admin-panel.ts` layout
- [ ] Build stats cards (total products, low stock, etc.)
- [ ] Build product table with search/filter
- [ ] Implement inline stock editor
- [ ] Add badge toggle switches
- [ ] Build product editor modal with full form
- [ ] Implement create product functionality
- [ ] Implement update product functionality
- [ ] Add delete confirmation dialog
- [ ] Test all CRUD operations
- [ ] Add optimistic UI updates
- [ ] Handle error states gracefully

### Phase 6: Polish & Testing (Days 13-14)

- [ ] Add loading spinners throughout app
- [ ] Implement toast notifications for actions
- [ ] Add empty states (no products, no cart items, etc.)
- [ ] Test all user flows end-to-end
- [ ] Test admin flows end-to-end
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing
- [ ] Fix any UI bugs
- [ ] Performance optimization (lazy loading, etc.)
- [ ] Add meta tags for portfolio showcase
- [ ] Write README with project overview
- [ ] Deploy demo to Vercel/Netlify

### Bonus Features (If Time Permits)

- [ ] Add product image upload with Cloudinary/ImgBB
- [ ] Implement wishlist functionality
- [ ] Add product search autocomplete
- [ ] Build order history page
- [ ] Add pagination to products list
- [ ] Implement recently viewed products
- [ ] Add dark mode toggle
- [ ] Create admin analytics dashboard

---

## 📂 Complete File Tree

```
sticker-shop/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── config/
│   │   └── demo-mode.js
│   ├── services/
│   │   ├── printify.js              # Disabled in demo mode
│   │   ├── mock-data.service.js     # NEW - Demo data provider
│   │   └── auth.service.js          # NEW - JWT auth
│   ├── routes/
│   │   ├── products.js              # Mode-aware routing
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── auth.js                  # NEW - Auth endpoints
│   │   └── demo/
│   │       ├── admin.js             # NEW - Admin CRUD
│   │       └── products.js          # NEW - Demo products
│   ├── middleware/
│   │   ├── auth.middleware.js       # NEW - JWT validation
│   │   └── role.middleware.js       # NEW - Role checks
│   └── data/
│       └── demo-products.json       # NEW - Mock data store
├── frontend/
│   └── src/
│       └── app/
│           ├── components/
│           │   ├── products/
│           │   │   ├── products.ts
│           │   │   ├── products.html
│           │   │   └── products.css
│           │   ├── product-detail/
│           │   │   ├── product-detail.ts      # TO BUILD
│           │   │   ├── product-detail.html    # TO BUILD
│           │   │   └── product-detail.css     # TO BUILD
│           │   ├── cart/
│           │   │   └── ...                    # Existing
│           │   ├── auth/
│           │   │   ├── login/
│           │   │   │   ├── login.ts           # TO BUILD
│           │   │   │   ├── login.html         # TO BUILD
│           │   │   │   └── login.css          # TO BUILD
│           │   │   └── demo-login/
│           │   │       ├── demo-login.ts      # TO BUILD
│           │   │       ├── demo-login.html    # TO BUILD
│           │   │       └── demo-login.css     # TO BUILD
│           │   └── admin/
│           │       ├── admin-panel.ts         # TO BUILD
│           │       ├── admin-panel.html       # TO BUILD
│           │       ├── admin-panel.css        # TO BUILD
│           │       ├── product-editor/
│           │       │   ├── product-editor.ts  # TO BUILD
│           │       │   ├── product-editor.html# TO BUILD
│           │       │   └── product-editor.css # TO BUILD
│           │       └── stock-manager/
│           │           ├── stock-manager.ts   # TO BUILD
│           │           ├── stock-manager.html # TO BUILD
│           │           └── stock-manager.css  # TO BUILD
│           ├── services/
│           │   ├── products.ts                # Existing (use as-is)
│           │   ├── cart.service.ts            # Existing
│           │   ├── auth.service.ts            # TO BUILD
│           │   └── admin.service.ts           # TO BUILD
│           ├── models/
│           │   ├── product.model.ts           # Existing (keep as-is)
│           │   ├── cart.model.ts              # Existing
│           │   ├── user.model.ts              # TO BUILD
│           │   └── auth.model.ts              # TO BUILD
│           ├── guards/
│           │   ├── auth.guard.ts              # TO BUILD
│           │   └── admin.guard.ts             # TO BUILD
│           └── interceptors/
│               └── auth.interceptor.ts        # TO BUILD
├── DEMO_MODE_BLUEPRINT.md                     # This file
└── README.md
```

---

## 🎯 Success Criteria

### Demo Mode Complete When:

✅ **Products Flow:**
- Products list loads from API (not hardcoded)
- Filtering and sorting work correctly
- Product detail page shows full product info
- Variants are selectable
- Add to cart works with variants
- Stock levels display correctly

✅ **Authentication:**
- Demo login buttons work instantly
- Standard login works with email/password
- JWT tokens persist across page refreshes
- Protected routes redirect to login
- Logout clears tokens and redirects

✅ **Admin Panel:**
- Admin can view all products in table
- Inline stock editing works
- Badge toggles work
- Create product modal functions
- Edit product modal functions
- Delete product works with confirmation
- All changes reflect immediately in UI

✅ **User Experience:**
- No broken links
- Loading states everywhere
- Error messages are helpful
- Mobile responsive
- Fast and smooth interactions
- Professional appearance

✅ **Code Quality:**
- Clean separation between demo/production logic
- Reusable components
- Type-safe TypeScript
- No hardcoded data in frontend
- Environment-based configuration
- Ready for real API integration

---

## 📝 Notes for Future Development

### Switching to Production Mode

**Set environment variable:**
```bash
DEMO_MODE=false
PRINTIFY_API_KEY=<real_key>
PRINTIFY_SHOP_ID=<real_id>
```

**Backend automatically:**
- Routes to Printify service instead of mock data
- Disables admin CRUD endpoints (or routes to real DB)
- Enables real authentication

**Frontend requires:**
- No code changes (already using HTTP services)
- Update environment URLs if deploying to different domain

### Database Migration

When adding real database:

**Product Metadata Table:**
```sql
CREATE TABLE product_metadata (
  printify_product_id VARCHAR PRIMARY KEY,
  category VARCHAR,
  collection VARCHAR,
  subtitle VARCHAR,
  rating DECIMAL,
  review_count INT,
  is_new BOOLEAN,
  is_bestseller BOOLEAN,
  is_limited_edition BOOLEAN
);
```

Join Printify data with metadata on product ID.

### Bookshop Integration

Create new routes parallel to products:
- `/api/books`
- `/books` (frontend route)
- Separate book model and components
- Reuse cart/checkout logic

---

## 🚀 Deployment Strategy

### Demo Deployment

**Backend:** Deploy to Railway/Render/Fly.io
- Set `DEMO_MODE=true`
- No database required
- Auto-restart on crash

**Frontend:** Deploy to Vercel/Netlify
- Static build with Angular SSR
- Environment variable for API URL
- Auto-deploy on git push

**Domain:**
- Frontend: `nightreader-shop.vercel.app`
- Backend: `nightreader-api.railway.app`

### Production Deployment (Future)

**Backend:**
- Add PostgreSQL database
- Configure Printify API keys
- Set `DEMO_MODE=false`
- Enable CORS for production domain

**Frontend:**
- Custom domain (nightreadershop.com)
- CDN for images (Cloudinary)
- Analytics (Google Analytics or Plausible)

---

## 📚 References

### Key Files to Reference

- **Product Model:** `frontend/src/app/models/product.model.ts`
- **Mock Data:** `frontend/src/app/services/shop/mock-products.ts` (migrate to backend)
- **Printify Service:** `backend/services/printify.js` (disable in demo)
- **Cart Service:** `frontend/src/app/services/cart.service.ts` (working example)

### Technologies Used

- **Frontend:** Angular 19, TypeScript, Signals API
- **Backend:** Node.js, Express.js
- **Auth:** JWT (jsonwebtoken package)
- **HTTP:** Axios (backend), HttpClient (frontend)
- **Styling:** CSS (custom design system)

### Design Patterns

- **Repository Pattern:** Services abstract data access
- **Guard Pattern:** Route protection with Angular guards
- **Interceptor Pattern:** JWT token injection
- **Strategy Pattern:** Mode switching (demo vs production)
- **Observer Pattern:** Angular Signals for reactive state

---

## 🎓 Learning Outcomes (Portfolio Value)

This project demonstrates:

✅ Full-stack TypeScript development
✅ RESTful API design
✅ JWT authentication & authorization
✅ Role-based access control
✅ CRUD operations
✅ State management with Angular Signals
✅ Responsive UI design
✅ Mode-based architecture (demo/production)
✅ Mock data patterns for testing
✅ Admin panel development
✅ E-commerce cart/checkout flow
✅ API integration strategy
✅ Production-ready code structure

---

**Blueprint Version:** 1.0
**Last Updated:** November 24, 2025
**Status:** Ready for Implementation
**Timeline:** Complete by December 2nd, 2025
