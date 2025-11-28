# Night Reader Sticker Shop - Complete Project Documentation

## A. Project Overview

### High-Level Description

Night Reader Sticker Shop is a modern e-commerce platform built with **Domain-Driven Design (DDD)** principles, implementing a clean separation between frontend (Angular 20) and backend (Express.js/TypeScript). The project emphasizes type safety, signal-based reactive state management, and a repository pattern that enables seamless transitions between storage implementations.

### Primary Goals

1. **MVP E-Commerce Platform**: Deliver a functional online sticker shop with cart, checkout, and user management
2. **Demo-First Development**: Build with file-based storage for rapid prototyping and demos
3. **Production-Ready Architecture**: Design for easy migration to production database systems
4. **Type-Safe Full Stack**: Maintain TypeScript across frontend and backend with aligned types
5. **Modern Frontend Patterns**: Leverage Angular 20 signals, standalone components, and functional programming

### MVP Status Summary

**Current Phase**: Post Phase 2 Cleanup → Moving toward hands-on development

**Completed**:
- ✅ Full authentication system (JWT, login, register, protected routes)
- ✅ Shopping cart with add/update/remove operations
- ✅ Product catalog with filtering, sorting, and detail views
- ✅ Admin panel structure with role-based access
- ✅ User-specific order history (localStorage-based)
- ✅ Demo data seeding system
- ✅ Printify integration removed and replaced with seed-based products

**In Progress**:
- 🟡 Admin user management (backend complete, UI complete)
- 🟡 Order creation workflow (partial implementation)
- 🟡 Account settings (UI exists, backend endpoints stubbed)

**Not Started**:
- ❌ Payment processing integration
- ❌ Real database implementation
- ❌ Email notifications
- ❌ Product search (backend-driven)
- ❌ Shipping/tracking integration
- ❌ Comprehensive testing suite

### Demo Mode vs Production Mode

**Demo Mode** (`DEMO_MODE=true` in `.env`):
- File-based storage: `backend/data/demo-users.json`, `demo-products.json`
- In-memory cart storage (Map-based, lost on restart)
- Auto-seeding on server startup
- Predefined demo accounts:
  - User: `demo@nightreader.com` / `demo123`
  - Admin: `admin@nightreader.com` / `admin123`
- Plain-text password storage (acceptable for demos only)
- Demo admin routes enabled at `/api/demo/admin`
- Frontend order history stored in browser localStorage

**Production Mode** (`DEMO_MODE=false`):
- Requires database implementation (PostgreSQL planned)
- Persistent cart storage in database
- Password hashing with bcrypt
- Real payment gateway integration
- Demo routes disabled
- Email verification and notifications
- Proper session management

---

## B. Full File Structure Map

### Backend Structure (`/backend/`)

```
backend/
├── data/                           # Demo mode persistent storage
│   ├── demo-users.json            # User accounts (2 seeded: demo, admin)
│   └── demo-products.json         # Product catalog (seeded from seed-products.ts)
│
├── src/
│   ├── domain/                    # Domain-Driven Design: Business logic layer
│   │   ├── auth/
│   │   │   ├── auth.types.ts      # User, LoginResult, RegisterUserInput, IAuthRepository
│   │   │   ├── auth.service.ts    # Business logic: login, register, JWT lifecycle
│   │   │   ├── auth.controller.ts # HTTP handlers: /login, /register, /logout, /me
│   │   │   └── auth.router.ts     # Route definitions + DI setup
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.types.ts      # Cart, CartItem, CartTotals, ICartRepository
│   │   │   ├── cart.service.ts    # Business rules: totals calc, free shipping logic
│   │   │   ├── cart.controller.ts # HTTP handlers: add/update/remove/clear
│   │   │   └── cart.router.ts     # Route definitions + DI
│   │   │
│   │   └── products/
│   │       ├── product.types.ts   # Product entity, badges, variants, IProductRepository
│   │       ├── product.service.ts # CRUD, stock management, catalog metadata
│   │       ├── product.controller.ts # HTTP handlers for product operations
│   │       └── product.router.ts  # Route definitions + singleton pattern
│   │
│   ├── infra/                     # Infrastructure: Storage implementations
│   │   └── demo/
│   │       ├── demo-auth.store.ts    # Implements IAuthRepository (file-based)
│   │       ├── demo-product.store.ts # Implements IProductRepository (file-based)
│   │       └── demo-cart.store.ts    # Implements ICartRepository (in-memory Map)
│   │
│   ├── seeds/                     # Data seeding system
│   │   ├── seed-all.ts           # Master orchestration: users → products
│   │   └── seed-products.ts      # 20+ products across 3 collections
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification, attaches req.user
│   │   ├── error-handler.ts      # Global error catching (dev vs prod)
│   │   ├── validate.ts           # Zod schema validation wrapper
│   │   └── not-found.ts          # 404 handler
│   │
│   ├── config/
│   │   └── env.ts                # Zod-validated environment variables
│   │
│   ├── app.ts                    # Express app setup: CORS, routes, middleware
│   └── server.ts                 # Entry point: seed check → start server
│
├── routes/                        # Legacy/demo routes (JavaScript)
│   ├── demo/
│   │   └── admin.js              # Admin endpoints for demo mode (user management added)
│   └── orders.js                 # Basic order endpoints (partially implemented)
│
├── middleware/
│   └── role.middleware.js        # Role-based access control (requireAdmin)
│
├── .env                          # Environment config (NOT committed)
├── .env.example                  # Template for environment variables
├── package.json
└── tsconfig.json
```

### Frontend Structure (`/frontend/src/app/`)

```
frontend/src/app/
├── features/                      # Feature modules (Signals-based state)
│   ├── auth/
│   │   ├── auth.store.ts         # State: user, loading, error + computed isAuthenticated
│   │   ├── auth.api.ts           # HTTP: login, register, me, logout
│   │   └── auth.types.ts         # User, LoginRequest, RegisterRequest, AuthResponse
│   │
│   ├── cart/
│   │   ├── cart.store.ts         # State: items, totals, drawer + localStorage sync
│   │   ├── cart.api.ts           # HTTP: add, update, remove, clear, get
│   │   └── cart.types.ts         # Cart, CartItem, CartTotals, requests
│   │
│   └── products/
│       ├── product.store.ts      # State: products, catalog + computed filters
│       ├── product.api.ts        # HTTP: getAll, getById, getCatalog
│       └── product.types.ts      # Product, ProductCatalog, responses
│
├── components/
│   ├── home/                     # Landing page
│   ├── products/                 # Product listing with filters + sorting
│   ├── product-detail/           # Detail view with variants + related products
│   ├── cart/                     # Full cart page
│   ├── checkout/                 # Checkout flow (partial implementation)
│   ├── cart-drawer/              # Sliding cart drawer (controlled by cart.store)
│   ├── cart-item/                # Reusable cart item component
│   ├── cart-summary/             # Order totals display
│   │
│   ├── account/                  # User account area
│   │   ├── login/                # Login form
│   │   ├── signup/               # Registration form
│   │   ├── dashboard/            # User dashboard (reader level, activity)
│   │   ├── orders/               # Order history (localStorage-based)
│   │   └── settings/             # Profile, password, notifications, delete account
│   │
│   ├── admin/                    # Admin-only area
│   │   ├── admin-panel/          # Main admin dashboard (tabs: general, products, sales, users)
│   │   ├── product-editor/       # Product CRUD modal
│   │   ├── stock-manager/        # Stock update component
│   │   └── badge-toggle/         # Badge management component
│   │
│   └── shared/                   # Shared UI components
│       └── demo-login/           # Quick demo login modal
│
├── models/
│   ├── product.model.ts          # Product, enums (Category, Collection, Badge)
│   └── user.model.ts             # User, NotificationPreferences, ActivityItem
│
├── services/
│   ├── admin.service.ts          # Admin API calls (products, users, orders)
│   └── toast.service.ts          # Toast notification system
│
├── guards/
│   ├── auth.guard.ts             # Requires isAuthenticated, redirects with returnUrl
│   └── admin.guard.ts            # Requires isAuthenticated + isAdmin
│
├── interceptors/
│   └── auth.interceptor.ts       # Adds Authorization: Bearer header
│
├── core/
│   └── config/
│       └── api.config.ts         # Centralized API endpoint definitions
│
├── app.ts                        # Root component with nav + router-outlet + cart-drawer
├── app.routes.ts                 # Route configuration with guards
├── app.config.ts                 # Angular app providers (router, HTTP, interceptors)
└── environments/
    ├── environment.ts            # Dev environment (apiUrl: localhost:3000)
    └── environment.prod.ts       # Prod environment
```

**Key Removals** (Post Printify Removal):
- ❌ `backend/services/printify.js` (deleted)
- ❌ `backend/routes/products.js` (old Printify-based routes, deleted)
- ❌ `backend/seeds/` old structure (replaced with TypeScript seed system)

---

## C. Backend Architecture Summary

### Auth Domain

**Types** (`auth.types.ts`):
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(input: RegisterUserInput): Promise<User>;
  getUserWithPassword(email: string): Promise<(User & { password: string }) | null>;
}
```

**Service** (`auth.service.ts`):
- `login(email, password)`: Validates credentials, generates JWT
- `register(email, password, name)`: Creates user, auto-login
- `verifyToken(token)`: Decodes JWT and validates
- Demo mode: Plain-text password comparison
- Production: Would use bcrypt

**Controller** (`auth.controller.ts`):
- POST `/api/auth/login` → `{ success, data: { token, user } }`
- POST `/api/auth/register` → `{ success, data: { token, user } }`
- GET `/api/auth/me` → `{ success, data: { user } }` (requires auth middleware)
- POST `/api/auth/logout` → `{ success, message }`

**Store** (`demo-auth.store.ts`):
- File: `backend/data/demo-users.json`
- 5-second cache TTL for performance
- Sequential ID generation (numeric strings)
- Predefined demo accounts seeded on init

### Cart Domain

**Types** (`cart.types.ts`):
```typescript
interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

const CART_CONSTANTS = {
  FREE_SHIPPING_THRESHOLD: 50,
  TAX_RATE: 0.08,
  STANDARD_SHIPPING: 5.99
};
```

**Service** (`cart.service.ts`):
- `getCart(userId)`: Retrieves cart + calculates totals
- `addItem(userId, input)`: Adds item or increments quantity
- `updateItem(userId, itemId, quantity)`: Updates quantity
- `removeItem(userId, itemId)`: Removes item from cart
- `clearCart(userId)`: Empties cart
- **Totals Calculation**:
  - Subtotal: Sum of (price × quantity)
  - Shipping: $5.99 if subtotal < $50, else $0
  - Tax: Subtotal × 8%
  - Total: Subtotal + Shipping + Tax

**Controller** (`cart.controller.ts`):
- GET `/api/cart` → `{ success, data: { cart, totals } }`
- POST `/api/cart/add` → `{ success, data: { cart, totals } }`
- PUT `/api/cart/update/:itemId` → `{ success, data: { cart, totals } }`
- DELETE `/api/cart/remove/:itemId` → `{ success, data: { cart, totals } }`
- DELETE `/api/cart/clear` → `{ success, data: { cart, totals } }`

**Store** (`demo-cart.store.ts`):
- **In-memory Map**: `Map<userId, Cart>`
- Per-user isolation
- Lost on server restart (acceptable for demo)
- Duplicate detection: Increments quantity if product already in cart

### Products Domain

**Types** (`product.types.ts`):
```typescript
enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  LIMITED = 'limited',
  SALE = 'sale'
}

interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  collection: ProductCollection;
  price: number;
  stock: number;
  images: ProductImage[];
  badges: ProductBadge[];
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStock(id: string, stock: number): Promise<Product>;
  toggleBadge(id: string, badge: ProductBadge): Promise<Product>;
}
```

**Service** (`product.service.ts`):
- `getAllProducts()`: Returns full catalog
- `getProductById(id)`: Single product lookup
- `getCatalog()`: Metadata (categories, collections, badge counts)
- `updateStock(id, stock)`: Admin stock management
- `toggleBadge(id, badge)`: Admin badge toggle (add/remove)
- CRUD operations with validation

**Controller** (`product.controller.ts`):
- GET `/api/products` → `{ success, data: Product[] }`
- GET `/api/products/:id` → `{ success, data: Product }`
- GET `/api/products/catalog` → `{ success, data: ProductCatalog }`
- PATCH `/api/products/:id/stock` → Admin only
- PATCH `/api/products/:id/badges` → Admin only

**Store** (`demo-product.store.ts`):
- File: `backend/data/demo-products.json`
- 5-second cache TTL
- Auto-creates data directory
- Sequential ID generation

### Seed System

**Seed Flow** (`seed-all.ts`):
1. Check if `demo-users.json` and `demo-products.json` are empty
2. If empty, seed users:
   - Demo user: `demo@nightreader.com` / `demo123`
   - Admin user: `admin@nightreader.com` / `admin123`
3. Seed products from `seed-products.ts` (20+ products)
4. Log summary: user count, product count, categories, collections, badges

**Product Seeds** (`seed-products.ts`):
- **Collections**: Dark Academia, Midnight Minimalist, Mythic Fantasy
- **Categories**: stickers, apparel, mugs, posters, bookmarks, phone-cases
- **Badges**: NEW, BESTSELLER, LIMITED, SALE
- Rich metadata: Multiple images, variants (size/color), pricing tiers

**Startup Integration** (`server.ts`):
```typescript
async function main() {
  const authStore = new DemoAuthStore();
  const productStore = new DemoProductStore();

  // Auto-seed if stores are empty
  await seedAll(authStore, productStore);

  const app = createApp();
  app.listen(3000);
}
```

### Middleware & Configuration

**Authentication Middleware** (`middleware/auth.middleware.ts`):
```typescript
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = authService.verifyToken(token);
  req.user = payload; // { userId, email, role }
  next();
};
```

**Error Handler** (`middleware/error-handler.ts`):
- Global catch-all (must be registered LAST in middleware chain)
- Development: Returns full error + stack
- Production: Returns generic "Internal server error"

**Validation Middleware** (`middleware/validate.ts`):
```typescript
export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.errors
    });
  }
  next();
};
```

**Environment Config** (`config/env.ts`):
```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  DEMO_MODE: z.string().default('true').transform(val => val === 'true'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('24h'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:4200,http://localhost:5000')
});

export const env = loadEnv(); // Validates on startup
```

### Request Flow Example

**Adding Item to Cart**:
```
POST /api/cart/add
Authorization: Bearer <token>
Body: { productId, quantity, price, title, imageUrl }

→ Express app
→ JSON body parser
→ Cart router (/api/cart)
→ Cart controller.addItem()
  → Extracts userId from req.user (set by auth middleware if authenticated)
  → Falls back to 'guest' if no user
  → Calls cartService.addItem(userId, input)
    → Calls cartRepository.addItem()
    → Checks for duplicate product → increments quantity
    → Saves to Map<userId, Cart>
    → Calculates totals (subtotal, shipping, tax, total)
  → Returns { success: true, data: { cart, totals } }
→ Response sent to frontend

Frontend:
→ cartApi.addItem() receives response
→ cartStore updates signals: items, _totals
→ effect() saves items to localStorage
→ Template reactively updates (cart count, drawer content)
```

---

## D. Frontend Architecture Summary

### Signal-Based State Management Pattern

**Core Principle**: Signals replace RxJS-heavy state management for local/global state, while Observables remain for HTTP calls.

**Example: Auth Store** (`auth.store.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly TOKEN_KEY = 'night_reader_token';

  // Private writable signals
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals (auto-update when dependencies change)
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor() {
    this.loadUserFromToken(); // Init from localStorage
    this.migrateOldLocalStorage(); // Cleanup old shared data
  }

  login(email: string, password: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.login({ email, password }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
          this._user.set(response.data.user);
          this._loading.set(false);
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this._error.set(err.error?.message || 'Login failed');
        this._loading.set(false);
      }
    });
  }

  logout(): void {
    const userId = this._user()?.id;

    // Clear user-specific localStorage data
    if (userId) {
      this.clearUserData(userId); // Removes user_orders_{userId}, etc.
    }

    localStorage.removeItem(this.TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}
```

**Component Usage**:
```typescript
@Component({...})
export class LoginComponent {
  auth = inject(AuthStore);

  // Template can directly use: {{ auth.user()?.name }}
  // Automatically tracks signal changes, no manual subscriptions
}
```

### Cart Store Architecture

**Key Features**:
- Dual persistence: localStorage (client) + backend (server)
- Drawer state management
- Backend-calculated totals (frontend is read-only)
- Auto-sync via effects

**Implementation** (`cart.store.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly STORAGE_KEY = 'night_reader_cart';

  // State signals
  private _items = signal<CartItem[]>([]);
  private _totals = signal<CartTotals>({ subtotal: 0, shipping: 0, tax: 0, total: 0, itemCount: 0 });
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _isDrawerOpen = signal(false);

  // Public readonly
  readonly items = this._items.asReadonly();
  readonly totals = this._totals.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isDrawerOpen = this._isDrawerOpen.asReadonly();

  constructor() {
    // Load from localStorage on init
    this.loadFromStorage();

    // Load from backend (overwrites with server truth)
    this.loadCart();

    // Auto-save to localStorage when items change
    effect(() => {
      const items = this._items();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    });
  }

  addItem(request: AddToCartRequest): void {
    this._loading.set(true);

    this.api.addItem(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._items.set(response.data.cart.items);
          this._totals.set(response.data.totals); // Backend-calculated
          this.openDrawer(); // Show cart drawer on add
          this._loading.set(false);
        }
      },
      error: (err) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  // Drawer controls
  openDrawer(): void { this._isDrawerOpen.set(true); }
  closeDrawer(): void { this._isDrawerOpen.set(false); }
  toggleDrawer(): void { this._isDrawerOpen.update(v => !v); }
}
```

**Important**: Frontend NEVER calculates totals—always uses backend values to ensure consistency.

### Product Store Architecture

**Features**:
- Full catalog loading (no pagination yet)
- Client-side filtering/sorting
- Related products via category
- Catalog metadata (categories, collections)

**Implementation** (`product.store.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class ProductStore {
  private _products = signal<Product[]>([]);
  private _catalog = signal<ProductCatalog | null>(null);
  private _selectedProduct = signal<Product | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed filters
  readonly productCount = computed(() => this._products().length);
  readonly hasProducts = computed(() => this.productCount() > 0);
  readonly bestsellers = computed(() =>
    this._products().filter(p => p.badges.includes(ProductBadge.BESTSELLER))
  );
  readonly newProducts = computed(() =>
    this._products().filter(p => p.badges.includes(ProductBadge.NEW))
  );

  // Dynamic filters
  getProductsByCategory(category: ProductCategory): Signal<Product[]> {
    return computed(() =>
      this._products().filter(p => p.category === category)
    );
  }

  getProductsByCollection(collection: ProductCollection): Signal<Product[]> {
    return computed(() =>
      this._products().filter(p => p.collection === collection)
    );
  }
}
```

### Component Patterns (Angular 20)

**Standalone Components** (no NgModules):
```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  private productStore = inject(ProductStore);
  private cartStore = inject(CartStore);

  // Local filter state (not global store)
  selectedCategory = signal<ProductCategory | null>(null);
  selectedCollection = signal<ProductCollection | null>(null);
  priceRange = signal<{ min: number; max: number }>({ min: 0, max: 100 });
  sortBy = signal<SortOption>(SortOption.NEWEST);

  // Computed filtered + sorted products
  filteredProducts = computed(() => {
    let products = this.productStore.products();

    // Filter by category
    if (this.selectedCategory()) {
      products = products.filter(p => p.category === this.selectedCategory());
    }

    // Filter by collection
    if (this.selectedCollection()) {
      products = products.filter(p => p.collection === this.selectedCollection());
    }

    // Filter by price
    const { min, max } = this.priceRange();
    products = products.filter(p => p.price >= min && p.price <= max);

    // Sort
    return this.sortProducts(products, this.sortBy());
  });

  addToCart(product: Product): void {
    this.cartStore.addItem({
      productId: product.id,
      quantity: 1,
      price: product.price,
      title: product.title,
      imageUrl: product.images[0].url
    });
  }
}
```

**Template Syntax** (Angular 20):
```html
<!-- Control flow: @if instead of *ngIf -->
@if (productStore.loading()) {
  <div class="loading">Loading products...</div>
} @else if (productStore.error()) {
  <div class="error">{{ productStore.error() }}</div>
} @else {
  <div class="products-grid">
    <!-- Loops: @for instead of *ngFor -->
    @for (product of filteredProducts(); track product.id) {
      <div class="product-card">
        <img [src]="product.images[0].url" [alt]="product.title">
        <h3>{{ product.title }}</h3>
        <p>{{ product.price | currency }}</p>
        <button (click)="addToCart(product)">Add to Cart</button>
      </div>
    } @empty {
      <p>No products match your filters</p>
    }
  </div>
}
```

### Routing & Guards

**Route Configuration** (`app.routes.ts`):
```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },

  // Public auth routes
  { path: 'account/login', component: LoginComponent },
  { path: 'account/signup', component: SignupComponent },

  // Protected user routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/orders',
    component: OrdersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: AccountSettingsComponent,
    canActivate: [authGuard]
  },

  // Admin routes
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [adminGuard] // Requires isAuthenticated + isAdmin
  }
];
```

**Auth Guard** (`guards/auth.guard.ts`):
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/account/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

**Admin Guard** (`guards/admin.guard.ts`):
```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }

  // Redirect to home if not admin
  return router.createUrlTree(['/']);
};
```

### HTTP Interceptor

**Auth Interceptor** (`interceptors/auth.interceptor.ts`):
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('night_reader_token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

**Registration** (`app.config.ts`):
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### API Configuration

**Centralized Endpoints** (`core/config/api.config.ts`):
```typescript
const BASE_URL = environment.apiUrl; // http://localhost:3000

export const ApiConfig = {
  AUTH: {
    LOGIN: () => `${BASE_URL}/api/auth/login`,
    REGISTER: () => `${BASE_URL}/api/auth/register`,
    ME: () => `${BASE_URL}/api/auth/me`,
    LOGOUT: () => `${BASE_URL}/api/auth/logout`
  },
  CART: {
    GET: () => `${BASE_URL}/api/cart`,
    ADD: () => `${BASE_URL}/api/cart/add`,
    UPDATE: (itemId: string) => `${BASE_URL}/api/cart/update/${itemId}`,
    REMOVE: (itemId: string) => `${BASE_URL}/api/cart/remove/${itemId}`,
    CLEAR: () => `${BASE_URL}/api/cart/clear`
  },
  PRODUCTS: {
    GET_ALL: () => `${BASE_URL}/api/products`,
    GET_BY_ID: (id: string) => `${BASE_URL}/api/products/${id}`,
    CATALOG: () => `${BASE_URL}/api/products/catalog`
  }
};
```

---

## E. User Flow Documentation

### Complete User Journey

#### 1. Landing Page → Browse Products

**Entry Point**: User visits http://localhost:5000

**Flow**:
1. App loads, `AuthStore` checks localStorage for token
2. If token exists → `loadCurrentUser()` → sets user state
3. Navigation displays:
   - Public: Shop, Cart (count badge if items exist)
   - Authenticated: Account dropdown (Dashboard, Orders, Settings, Logout)
   - Admin: Additional "Admin" link
4. Home component displays hero section + featured products
5. User clicks "Shop Now" → navigates to `/products`

#### 2. Product Listing → Filtering/Sorting

**URL**: `/products`

**Flow**:
1. `ProductsComponent` injects `ProductStore`
2. `ngOnInit()` → `productStore.loadAllProducts()`
3. API call: GET `/api/products` → returns `Product[]`
4. Store updates `_products` signal
5. Template renders product grid (reactive, no manual change detection)

**User Interactions**:
- **Category Filter**: Clicks "Stickers" → `selectedCategory.set(ProductCategory.STICKERS)`
  - Computed `filteredProducts` auto-updates
  - Template re-renders filtered list
- **Collection Filter**: Clicks "Dark Academia" → `selectedCollection.set(...)`
- **Price Range**: Drags slider → `priceRange.set({ min, max })`
- **Sort**: Selects "Price: Low to High" → `sortBy.set(SortOption.PRICE_ASC)`

**Result**: Product grid updates reactively based on computed filters.

#### 3. Product Detail → Add to Cart

**URL**: `/products/:id` (e.g., `/products/1`)

**Flow**:
1. `ProductDetailComponent` extracts `id` from route params
2. `productStore.loadProductById(id)` → sets `selectedProduct` signal
3. Component displays:
   - Image gallery (main image + thumbnails)
   - Product details (title, description, price, badges)
   - Variant selector (if variants exist)
   - Stock status (In Stock / Low Stock / Out of Stock)
   - Related products (same category)

**User Action: Add to Cart**:
1. User selects variant (if applicable): Color, Size
2. Clicks "Add to Cart" button
3. Component calls:
```typescript
this.cartStore.addItem({
  productId: product.id,
  quantity: 1,
  price: selectedVariant?.price || product.price,
  title: product.title,
  imageUrl: product.images[0].url
});
```
4. `CartStore.addItem()` → HTTP POST `/api/cart/add`
5. Backend:
   - Extracts `userId` from JWT (or 'guest')
   - Checks for duplicate product → increments quantity
   - Calculates totals
   - Returns `{ cart, totals }`
6. Frontend:
   - Updates `_items` and `_totals` signals
   - Opens cart drawer (slide-in from right)
   - Shows toast: "Added to cart"

#### 4. Cart Drawer → Full Cart Page

**Cart Drawer** (slide-in):
- Displays cart items (image, title, quantity, price)
- Quantity controls (+/- buttons)
- Remove button (X icon)
- Subtotal display
- "View Cart" button → navigates to `/cart`
- "Checkout" button → navigates to `/checkout`

**Full Cart Page** (`/cart`):
1. Displays all cart items in table format
2. Quantity input fields (editable)
3. Remove buttons per item
4. Order summary sidebar:
   - Subtotal
   - Shipping ($5.99 or FREE if > $50)
   - Tax (8%)
   - **Total**
5. "Continue Shopping" → back to `/products`
6. "Proceed to Checkout" → navigates to `/checkout`

**User Actions**:
- **Update Quantity**: Changes input, triggers `cartStore.updateQuantity(itemId, newQty)`
  - Debounced API call → recalculates totals
- **Remove Item**: Clicks X → `cartStore.removeItem(itemId)`
- **Clear Cart**: Clicks "Clear Cart" → `cartStore.clearCart()`

#### 5. Checkout Flow

**URL**: `/checkout`

**Current Implementation** (Partial):
1. Displays cart summary
2. Shows order total
3. "Complete Order" button
4. **On Click**:
   - Checks if user is authenticated
   - If not → redirects to `/account/login?returnUrl=/checkout`
   - If yes → Creates order in localStorage:
```typescript
const order = {
  id: `order_${Date.now()}`,
  orderNumber: generateOrderNumber(), // e.g., NR-20250127-001
  date: new Date(),
  status: 'processing',
  total: cartTotals.total,
  items: cartItems,
  userId: currentUser.id
};
localStorage.setItem(`user_orders_${currentUser.id}`, JSON.stringify([order, ...existingOrders]));
```
   - Clears cart
   - Redirects to `/dashboard/orders`

**Missing (Future Implementation)**:
- Payment gateway integration (Stripe, PayPal)
- Shipping address form
- Payment method selection
- Order confirmation email

#### 6. Account Dashboard → Order History

**URL**: `/dashboard`

**Dashboard** (`/dashboard`):
- User greeting: "Welcome back, [Name]"
- Reader level badge (Initiate/Apprentice/Adept/Master) based on order count
- Recent activity feed (mock data)
- Quick links: View Orders, Account Settings

**Orders Page** (`/dashboard/orders`):
1. Loads orders from localStorage: `user_orders_${userId}`
2. Displays order list (newest first):
   - Order number
   - Date
   - Status badge (Pending/Processing/Shipped/Delivered)
   - Total
   - Item count
3. Click order → expands to show order items

**Data Isolation**: Each user's orders stored in separate localStorage key (`user_orders_<userId>`).

#### 7. Logout Flow

**Trigger**: User clicks "Logout" in account dropdown

**Flow**:
1. `AuthStore.logout()` called
2. Retrieves `userId` before clearing
3. Clears user-specific localStorage:
   - `user_orders_${userId}`
   - (Future: `user_preferences_${userId}`, `user_cart_${userId}`)
4. Removes JWT token: `localStorage.removeItem('night_reader_token')`
5. Sets `_user` signal to `null`
6. Redirects to `/login`
7. Navigation updates (shows public links only)

#### 8. Error States & Redirects

**Unauthenticated Access to Protected Route**:
- User visits `/dashboard` without login
- `authGuard` checks `auth.isAuthenticated()` → false
- Redirects to `/account/login?returnUrl=/dashboard`
- After login → redirects back to `/dashboard`

**Non-Admin Access to Admin Route**:
- Authenticated user (non-admin) visits `/admin`
- `adminGuard` checks `auth.isAdmin()` → false
- Redirects to `/` (home page)
- Shows toast: "Admin access required"

**API Errors**:
- Network failure → Store sets `_error` signal
- Template displays error message
- Retry button available
- Toast notification for user feedback

**404 Not Found**:
- User visits invalid route → 404 page
- "Return to Shop" button

---

## F. Admin Flow Documentation

### Complete Admin Journey

#### 1. Admin Login

**Entry Point**: Admin visits `/account/login` or clicks "Admin" nav link (redirects if not authenticated)

**Credentials**:
- Email: `admin@nightreader.com`
- Password: `admin123`

**Flow**:
1. Enter credentials → Click "Sign In"
2. `AuthStore.login()` → JWT generated with `role: 'admin'`
3. Token stored in localStorage
4. `_user` signal updated with admin user object
5. `isAdmin()` computed signal returns `true`
6. Redirects to `/` (or returnUrl if provided)
7. Navigation displays "Admin" link (only visible to admins)

#### 2. Admin Panel Access

**URL**: `/admin`

**Protection**: `adminGuard` requires `isAuthenticated() && isAdmin()`

**Flow**:
1. Navigate to `/admin`
2. `AdminPanelComponent` loads:
   - `ngOnInit()` checks `auth.isAdmin()` → if false, redirect to `/`
   - Loads products: `adminService.getAllProducts()`
   - Loads users: `adminService.getAllUsers()`
3. Displays admin dashboard with tabs:
   - **General**: Overview stats (total products, new this month, low stock, out of stock)
   - **Products**: Product management table
   - **Sales**: Sales data (placeholder in demo mode)
   - **Users**: User management (newly implemented)

#### 3. Product Management Tab

**URL**: `/admin#products`

**Product Table Columns**:
- Checkbox (bulk selection)
- Image thumbnail
- Title
- Category
- Price
- Stock (inline editable)
- Badges (inline toggle)
- Actions (Edit, Delete)

**User Actions**:

**A. Update Stock**:
1. Admin clicks stock number → input field appears
2. Types new stock value → presses Enter or clicks checkmark
3. Component calls `adminService.updateStock(productId, newStock)`
4. Backend: PATCH `/api/demo/admin/products/:id/stock` with `{ stock: number }`
5. Store updates `products` signal
6. Table updates reactively
7. Toast: "Stock updated successfully"

**B. Toggle Badge**:
1. Admin clicks badge chip (e.g., "NEW")
2. Component calls `adminService.toggleBadge(productId, badge)`
3. Backend: PATCH `/api/demo/admin/products/:id/badges` with `{ badge: 'new' }`
4. If badge exists → removes it
5. If badge doesn't exist → adds it
6. Store updates
7. Badge chip visually toggles (filled/outlined)

**C. Edit Product**:
1. Admin clicks Edit icon (pencil)
2. Opens modal: `ProductEditorComponent`
3. Pre-fills form with product data:
   - Title, Description
   - Category, Collection
   - Price, Stock
   - Images (URLs)
   - Badges
   - Variants
4. Admin makes changes → clicks "Save"
5. Component calls `adminService.updateProduct(id, updates)`
6. Backend: PUT `/api/demo/admin/products/:id`
7. Validates input (Zod schema)
8. Updates `demo-products.json` file
9. Returns updated product
10. Store updates, modal closes
11. Toast: "Product updated successfully"

**D. Delete Product**:
1. Admin clicks Delete icon (trash)
2. Confirmation modal: "Delete [Product Title]? This cannot be undone."
3. Admin confirms
4. Component calls `adminService.deleteProduct(id)`
5. Backend: DELETE `/api/demo/admin/products/:id`
6. Removes from `demo-products.json`
7. Store removes from `products` signal
8. Table updates (product row disappears)
9. Toast: "Product deleted"

**E. Create New Product**:
1. Admin clicks "Add Product" button
2. Opens `ProductEditorComponent` in create mode (no pre-filled data)
3. Admin fills form
4. Clicks "Create"
5. Component calls `adminService.createProduct(input)`
6. Backend: POST `/api/demo/admin/products`
7. Generates new ID
8. Saves to `demo-products.json`
9. Returns created product
10. Store adds to `products` signal
11. Table updates
12. Toast: "Product created successfully"

#### 4. User Management Tab (NEW)

**URL**: `/admin#users`

**Implementation Status**: ✅ Fully implemented (backend + frontend)

**Features**:
- List all users from `demo-users.json`
- Search by name or email
- Click user to expand and view:
  - Account information (User ID, Email, Role)
  - Order history (loaded from `user_orders_${userId}` in localStorage)
- Admin can view ANY user's orders (admin privilege escalation)

**Flow**:
1. Admin navigates to Users tab
2. `AdminPanelComponent.loadUsers()` called
3. Backend: GET `/api/demo/admin/users`
   - Reads `demo-users.json`
   - Strips passwords from response
   - Returns `{ success: true, data: User[] }`
4. Frontend updates `users` signal
5. Displays user cards with avatars (initials), name, email, role badge

**User Actions**:

**A. Search Users**:
1. Admin types in search box
2. `userSearchQuery` signal updates
3. Computed `filteredUsers` auto-filters:
```typescript
filteredUsers = computed(() => {
  const query = this.userSearchQuery().toLowerCase();
  if (!query) return this.users();
  return this.users().filter(u =>
    u.name?.toLowerCase().includes(query) ||
    u.email?.toLowerCase().includes(query)
  );
});
```
4. Table updates reactively

**B. View User Details**:
1. Admin clicks on user card
2. Card expands (smooth animation)
3. Component calls `loadUserOrders(userId)`:
```typescript
loadUserOrders(userId: string): void {
  const storageKey = `user_orders_${userId}`;
  const savedOrders = localStorage.getItem(storageKey);
  if (savedOrders) {
    const orders = JSON.parse(savedOrders);
    this.userOrders.set(orders);
  }
}
```
4. Displays:
   - **Account Info**: User ID, Email, Role
   - **Order History**: Order number, date, status, total, item count
5. If no orders → "No orders found for this user"

**C. Collapse User Details**:
1. Admin clicks same user card again
2. `selectedUserId.set(null)`
3. `userOrders.set([])`
4. Card collapses

**Admin Privilege**: Admin can access localStorage data for ANY user by reading their specific key. This is intentional for administrative oversight.

#### 5. Data Persistence in Admin Panel

**Important Note**: All admin changes persist to JSON files in `backend/data/`:

- Product changes → `demo-products.json` (updated immediately)
- User data → `demo-users.json` (seed-only, not editable in current implementation)
- Orders → `localStorage` on browser (not in backend for demo mode)

**Restart Behavior**:
- Server restart → products and users persist (files)
- Server restart → carts LOST (in-memory)
- Browser refresh → user session persists (localStorage token)
- Browser refresh → cart persists (localStorage + backend reload)

---

## G. UX Flow Summary

### Navigation Structure

**Public Navigation** (Unauthenticated):
```
┌─────────────────────────────────────────────┐
│ [Night Reader Logo]  Shop  Cart(0)  Login  │
└─────────────────────────────────────────────┘
```

**Authenticated Navigation** (User):
```
┌──────────────────────────────────────────────────────────┐
│ [Logo]  Shop  Cart(3)  [Account ▼]                      │
│                        ├─ Dashboard                       │
│                        ├─ Orders                          │
│                        ├─ Settings                        │
│                        └─ Logout                          │
└──────────────────────────────────────────────────────────┘
```

**Authenticated Navigation** (Admin):
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]  Shop  Cart(3)  Admin  [Account ▼]                   │
│                               ├─ Dashboard                    │
│                               ├─ Orders                       │
│                               ├─ Settings                     │
│                               └─ Logout                       │
└──────────────────────────────────────────────────────────────┘
```

### Page Hierarchy

```
/ (Home)
├── /products (Product Listing)
│   └── /products/:id (Product Detail)
├── /cart (Shopping Cart)
└── /checkout (Checkout)

/account/login (Login)
/account/signup (Signup)

/dashboard (User Dashboard) [AUTH REQUIRED]
├── /dashboard/orders (Order History) [AUTH REQUIRED]
└── /settings (Account Settings) [AUTH REQUIRED]

/admin (Admin Panel) [ADMIN REQUIRED]
```

### Component → Store → Signal Flow

**Example: Adding Product to Cart**

```
ProductDetailComponent
  ↓ (user clicks "Add to Cart")
cartStore.addItem({ productId, quantity, ... })
  ↓
cartApi.addItem(request)
  ↓ (HTTP POST /api/cart/add)
Backend: CartController.addItem()
  ↓
CartService.addItem(userId, input)
  ↓
DemoCartStore.addItem() → Map update
  ↓
CartService.calculateTotals()
  ↓
Response: { success: true, data: { cart, totals } }
  ↓
cartApi returns Observable
  ↓
cartStore.addItem() subscribe block:
  _items.set(cart.items)
  _totals.set(totals)
  openDrawer()
  ↓
effect() triggers:
  localStorage.setItem('night_reader_cart', items)
  ↓
Signals propagate to templates:
  - Cart count badge updates (nav bar)
  - Cart drawer opens (slide-in animation)
  - Cart items list updates
  - Totals update
  ↓
User sees updated cart immediately (reactive UI)
```

### Signal-Driven UI Updates

**Key Principle**: No manual change detection needed. Signals track dependencies and auto-update templates.

**Example: Product Filtering**

```
User changes category filter
  ↓
selectedCategory.set(ProductCategory.STICKERS)
  ↓
Computed signal recalculates:
filteredProducts = computed(() => {
  return productStore.products().filter(p =>
    p.category === this.selectedCategory()
  );
})
  ↓
Template @for loop tracks filteredProducts signal
  ↓
Template re-renders with filtered list
  ↓
User sees updated product grid (no loading spinner, instant)
```

**No Manual Subscriptions**: Unlike RxJS patterns, signals don't require `.subscribe()` or `async` pipe in templates.

### Drawer/Modal State Management

**Cart Drawer**:
- Controlled by `cartStore.isDrawerOpen` signal
- Positioned fixed, right side, slides in from off-screen
- Click outside or close button → `closeDrawer()`
- Add to cart → `openDrawer()` + auto-close after 5s (optional)

**Product Editor Modal** (Admin):
- Controlled by `adminPanel.showEditor` signal
- Backdrop overlay (click to close)
- Form with validation
- Save → API call → close modal
- Cancel → close modal without saving

---

## H. What Is Fully Implemented

### Backend (Complete Features)

✅ **Domain Layer Architecture**
- Auth domain with service, controller, router, types
- Cart domain with business logic (totals calculation)
- Products domain with CRUD operations

✅ **Infrastructure Layer**
- Demo stores implementing repository interfaces
- File-based persistence (`demo-users.json`, `demo-products.json`)
- In-memory cart storage

✅ **Authentication & Authorization**
- JWT generation and verification
- Login, register, logout, /me endpoints
- Auth middleware (`authenticate`)
- Role-based middleware (`requireAdmin`)
- Demo user accounts seeded

✅ **Cart System**
- Add, update, remove, clear operations
- Totals calculation (subtotal, shipping, tax, total)
- Free shipping threshold ($50)
- Tax rate (8%)
- Per-user cart isolation (guest + authenticated)

✅ **Product System**
- Full CRUD endpoints
- Catalog endpoint (categories, collections metadata)
- Admin stock updates
- Admin badge toggling (NEW, BESTSELLER, LIMITED, SALE)
- Rich product data (images, variants, badges)

✅ **Seed System**
- Auto-seeding on startup (checks if empty)
- 2 predefined users (demo, admin)
- 20+ products across 3 collections
- Organized by categories and collections

✅ **Middleware & Error Handling**
- Global error handler (dev/prod modes)
- Request validation (Zod schemas)
- 404 handler
- CORS configuration

✅ **Environment Configuration**
- Type-safe env validation (Zod)
- Demo mode toggle
- JWT secret and expiry config

✅ **Admin Endpoints (Demo Mode)**
- Product management (CRUD, stock, badges)
- User listing (GET `/api/demo/admin/users`)
- User details (GET `/api/demo/admin/users/:userId`)

### Frontend (Complete Features)

✅ **Signal-Based State Management**
- AuthStore with user, loading, error signals
- CartStore with items, totals, drawer state
- ProductStore with products, catalog, filters
- Computed signals for reactive data

✅ **Authentication System**
- Login, register, logout flows
- JWT token storage (localStorage)
- Protected routes (authGuard, adminGuard)
- HTTP interceptor (auto-attach Bearer token)
- User session persistence

✅ **Shopping Cart**
- Add to cart from product listing or detail
- Update quantity (inline editing)
- Remove items
- Clear cart
- Cart drawer (slide-in UI)
- Full cart page
- Backend-calculated totals display

✅ **Product Browsing**
- Product listing with grid layout
- Client-side filtering (category, collection, price)
- Client-side sorting (newest, price, name)
- Product detail page with image gallery
- Variant selection (color, size)
- Stock status display
- Related products by category
- Badge display (NEW, BESTSELLER, etc.)

✅ **Account Area**
- Login page
- Signup page
- Dashboard (reader level, activity feed)
- Order history (localStorage-based)
- Account settings UI (profile, password, notifications)

✅ **Admin Panel**
- Role-based access (adminGuard)
- Tabs: General, Products, Sales, Users
- Product table with inline stock editing
- Badge toggle functionality
- Product editor modal (create/update)
- Delete confirmation
- User management table (search, expand for details, view orders)

✅ **Angular 20 Patterns**
- Standalone components (no NgModules)
- `@if`/`@for` control flow syntax
- Functional guards and interceptors
- Inject function for DI

✅ **Type Safety**
- Full TypeScript coverage
- Type alignment between frontend/backend
- Enums for categories, collections, badges, roles

✅ **Routing**
- Public routes (home, products, cart, checkout)
- Auth routes (login, signup)
- Protected user routes (dashboard, orders, settings)
- Protected admin routes (admin panel)
- Route guards with returnUrl support

---

## I. What Is Partially Implemented

### Backend (Incomplete/Partial)

🟡 **Order Management**
- **Status**: Routes exist (`/api/orders`), minimal logic
- **What Works**: Basic endpoints defined
- **What's Missing**:
  - Order creation from checkout
  - Payment integration
  - Order status tracking
  - Email confirmations
  - Webhooks for payment providers

🟡 **Admin Routes**
- **Status**: Product management complete, user management complete
- **What's Missing**:
  - Order management for admins
  - Sales analytics
  - User editing/deletion
  - Bulk operations
  - Export functionality

🟡 **Product Search**
- **Status**: Frontend has search UI, no backend implementation
- **What's Missing**:
  - Full-text search endpoint
  - Search indexing
  - Autocomplete
  - Search suggestions

### Frontend (Incomplete/Partial)

🟡 **Checkout Component**
- **Status**: Basic UI exists, order creation logic stubbed
- **What Works**:
  - Cart summary display
  - Order total calculation
  - Basic order creation (localStorage)
- **What's Missing**:
  - Shipping address form
  - Payment method selection
  - Payment gateway integration (Stripe UI)
  - Order confirmation page
  - Email receipt

🟡 **Account Settings**
- **Status**: UI complete, backend endpoints missing
- **What Works**:
  - Profile form (firstName, lastName, email, phone)
  - Password change form (validation)
  - Notification preferences toggles
  - Delete account modal
- **What's Missing**:
  - Backend endpoints for profile updates
  - Backend endpoint for password changes
  - Backend endpoint for preference updates
  - Backend endpoint for account deletion
  - Email verification

🟡 **Product Detail Variants**
- **Status**: UI exists for variant selection
- **What Works**:
  - Variant display (colors, sizes)
  - Price override for variants
- **What's Missing**:
  - Per-variant stock tracking
  - Variant image switching
  - Variant SKU management

🟡 **Order History**
- **Status**: Basic display from localStorage
- **What Works**:
  - Order list display
  - Order status badges
  - Order totals
- **What's Missing**:
  - Order detail view (expand to see all items)
  - Order tracking/shipping info
  - Reorder functionality
  - Invoice download

🟡 **Admin Panel Features**
- **Status**: Core structure complete, missing advanced features
- **What's Missing**:
  - Sales charts/graphs
  - Analytics dashboard
  - Order management for admins
  - Customer support tools
  - Inventory alerts

---

## J. What Is Missing (Remaining Goals)

### Critical Path to Production

#### 1. Payment Processing ❌
**Priority**: CRITICAL
**Description**: Integrate Stripe or PayPal for real transactions
**Tasks**:
- Add Stripe SDK to backend
- Create payment intent endpoint
- Build checkout form with Stripe Elements
- Handle payment success/failure webhooks
- Store payment records
- Implement refund functionality

#### 2. Real Database (PostgreSQL) ❌
**Priority**: CRITICAL
**Description**: Replace file-based storage with production database
**Tasks**:
- Set up PostgreSQL (local + production)
- Design database schema (users, products, carts, orders, payments)
- Implement database repositories (PostgresAuthRepository, etc.)
- Create migration system (e.g., Prisma, TypeORM)
- Seed scripts for production
- Connection pooling and optimization

#### 3. Complete Order Workflow ❌
**Priority**: CRITICAL
**Description**: End-to-end order creation, payment, and fulfillment
**Tasks**:
- Checkout form (shipping address, billing address)
- Order creation endpoint (creates order + payment intent)
- Order confirmation page
- Order status tracking
- Admin order management (view, update status, fulfill)
- Email notifications (order confirmation, shipping updates)

#### 4. Email System ❌
**Priority**: HIGH
**Description**: Transactional emails for user actions
**Tasks**:
- Integrate email service (SendGrid, AWS SES, Resend)
- Email templates (order confirmation, shipping, password reset)
- Welcome email on signup
- Order receipt with PDF invoice
- Shipping tracking notifications

#### 5. Product Search (Backend) ❌
**Priority**: MEDIUM
**Description**: Fast, relevant product search
**Tasks**:
- Full-text search implementation (PostgreSQL FTS or Elasticsearch)
- Search endpoint with filters + pagination
- Autocomplete/suggestions endpoint
- Search indexing strategy
- Search analytics tracking

#### 6. User Profile Management ❌
**Priority**: MEDIUM
**Description**: Complete account settings backend
**Tasks**:
- PUT `/api/user/profile` (update name, email, phone)
- PUT `/api/user/password` (change password with bcrypt)
- PUT `/api/user/preferences` (notification settings)
- DELETE `/api/user/account` (soft delete with cascade)
- Email verification flow
- Password reset flow

### Infrastructure & DevOps

#### 7. Testing Suite ❌
**Priority**: HIGH
**Description**: Automated tests for reliability
**Tasks**:
- Unit tests for backend services (Jest)
- Integration tests for API endpoints (Supertest)
- Frontend component tests (Jasmine/Karma)
- E2E tests (Cypress or Playwright)
- Test coverage reporting
- CI/CD integration

#### 8. Docker Containerization ❌
**Priority**: MEDIUM
**Description**: Containerize for deployment
**Tasks**:
- Dockerfile for backend
- Dockerfile for frontend (nginx)
- docker-compose.yml (backend + frontend + postgres + redis)
- Environment-specific configs
- Health checks
- Volume management

#### 9. CI/CD Pipeline ❌
**Priority**: MEDIUM
**Description**: Automated build, test, deploy
**Tasks**:
- GitHub Actions workflow (or GitLab CI)
- Automated testing on PR
- Build and push Docker images
- Deploy to staging on merge to develop
- Deploy to production on merge to main
- Rollback strategy

#### 10. Logging & Monitoring ❌
**Priority**: MEDIUM
**Description**: Track errors and performance
**Tasks**:
- Structured logging (Winston, Pino)
- Log aggregation (CloudWatch, DataDog)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (Pingdom, UptimeRobot)
- Alerting for critical errors

### Security & Compliance

#### 11. Password Hashing ❌
**Priority**: CRITICAL (for production)
**Description**: Secure password storage
**Tasks**:
- Implement bcrypt for password hashing
- Salt rounds configuration
- Password strength validation
- Secure password reset flow

#### 12. Rate Limiting ❌
**Priority**: HIGH
**Description**: Prevent abuse and brute-force attacks
**Tasks**:
- Express rate limiter middleware
- Per-IP limits for login attempts
- Per-user limits for API calls
- Exponential backoff for failed logins

#### 13. Security Headers ❌
**Priority**: MEDIUM
**Description**: Protect against XSS, clickjacking
**Tasks**:
- Helmet.js integration
- CSP (Content Security Policy)
- CSRF protection (for cookie-based sessions)
- Secure cookies (httpOnly, secure, sameSite)

#### 14. Data Validation & Sanitization ❌
**Priority**: HIGH
**Description**: Prevent injection attacks
**Tasks**:
- Extend Zod schemas for all endpoints
- SQL injection prevention (parameterized queries)
- XSS sanitization for user input
- File upload validation (if adding product images)

### User Experience Enhancements

#### 15. Responsive Design ❌
**Priority**: HIGH
**Description**: Mobile-friendly UI
**Tasks**:
- Mobile navigation (hamburger menu)
- Responsive grid layouts
- Touch-friendly controls
- Mobile cart drawer
- Tablet optimization

#### 16. Accessibility (A11y) ❌
**Priority**: MEDIUM
**Description**: WCAG 2.1 AA compliance
**Tasks**:
- ARIA labels and roles
- Keyboard navigation support
- Screen reader testing
- Focus management
- Color contrast compliance

#### 17. Form Validation & Error Display ❌
**Priority**: MEDIUM
**Description**: Better UX for form errors
**Tasks**:
- Real-time validation feedback
- Error messages below fields
- Success states (green checkmarks)
- Disabled submit until valid
- Accessible error announcements

#### 18. Loading States & Skeletons ❌
**Priority**: LOW
**Description**: Better perceived performance
**Tasks**:
- Skeleton loaders for product grids
- Spinner for button actions
- Progress indicators for checkout
- Optimistic UI updates

### Feature Additions

#### 19. Wishlist ❌
**Priority**: LOW
**Description**: Save products for later
**Tasks**:
- Wishlist store (frontend)
- Wishlist endpoints (backend)
- Add to wishlist button
- Wishlist page
- Move from wishlist to cart

#### 20. Product Reviews & Ratings ❌
**Priority**: LOW
**Description**: User-generated reviews
**Tasks**:
- Review model (user, product, rating, comment)
- Submit review endpoint
- Display reviews on product detail
- Average rating calculation
- Review moderation (admin)

#### 21. Abandoned Cart Recovery ❌
**Priority**: LOW (requires email system)
**Description**: Re-engage users who didn't checkout
**Tasks**:
- Track cart abandonment
- Email after 24h with cart link
- Discount code for abandoned carts
- Analytics on recovery rate

#### 22. Inventory Management ❌
**Priority**: MEDIUM
**Description**: Stock alerts and low-stock warnings
**Tasks**:
- Low stock threshold config
- Admin alerts when stock < threshold
- Auto-disable "Add to Cart" when out of stock
- Restock notifications for users
- Variant-level stock tracking

#### 23. Product Search Bar (Frontend) ❌
**Priority**: MEDIUM
**Description**: Search input in navigation
**Tasks**:
- Search input component
- Autocomplete dropdown
- Search results page
- Highlight matched terms
- Recent searches

#### 24. Pagination ❌
**Priority**: MEDIUM (for large catalogs)
**Description**: Handle large product sets
**Tasks**:
- Backend pagination (limit, offset)
- Frontend pagination UI
- Infinite scroll option
- "Load More" button
- Page number display

---

## K. Alignment Check & Recommendations

### Analysis of Your Stated Goals

You requested documentation for:
1. ✅ Complete understanding of all implemented features → **COVERED** (Sections C, D, H)
2. ✅ Full user flow documentation → **COVERED** (Section E)
3. ✅ Full admin flow documentation → **COVERED** (Section F)
4. ✅ Full UX flow documentation → **COVERED** (Section G)
5. ✅ Clear map of every domain → infra → store → UI connection → **COVERED** (Sections B, C, D, G)
6. ✅ Full project file structure → **COVERED** (Section B)
7. ✅ What is complete, partially complete, missing → **COVERED** (Sections H, I, J)

### Alignment Assessment

**Your goals are PERFECTLY ALIGNED** with the current state of your project. Here's why:

✅ **Architecture is Solid**: Your DDD approach with repository pattern and signal-based state management is production-ready. The separation of concerns is excellent.

✅ **MVP is Near Complete**: You have:
- Working auth system
- Full product catalog
- Functional cart
- Admin panel
- User account area

✅ **Demo Mode Success**: File-based storage + seeding system allows rapid iteration without database overhead. This is ideal for demos and prototyping.

✅ **Type Safety**: Full TypeScript alignment between frontend and backend reduces bugs and improves developer experience.

✅ **Documentation is the Right Next Step**: Before adding more features, documenting what exists ensures:
- New developers can onboard quickly
- You can identify gaps clearly
- Refactoring decisions are informed
- Technical debt is minimized

### Recommendations for Next Steps

#### Immediate Next Steps (1-2 Weeks)

1. **Complete Checkout Flow** (HIGH PRIORITY)
   - Implement payment integration (Stripe test mode)
   - Create order confirmation page
   - This unblocks user testing and demos

2. **Add Basic Testing** (MEDIUM PRIORITY)
   - Unit tests for critical services (auth, cart, product)
   - Integration tests for key endpoints
   - Prevents regression as you add features

3. **Implement Account Settings Backend** (LOW PRIORITY)
   - Profile update endpoint
   - Password change endpoint
   - Completes the user account experience

#### Short-Term Goals (1 Month)

4. **Database Migration** (CRITICAL for production)
   - Set up PostgreSQL
   - Implement Prisma or TypeORM
   - Create database repositories
   - This is the biggest architectural change needed

5. **Email System** (MEDIUM PRIORITY)
   - Integrate SendGrid or Resend
   - Order confirmation emails
   - Improves user experience significantly

6. **Responsive Design** (HIGH PRIORITY)
   - Mobile-friendly navigation
   - Responsive product grid
   - Essential for real-world usage

#### Medium-Term Goals (2-3 Months)

7. **Product Search (Backend)**
   - Full-text search with PostgreSQL
   - Improves discoverability

8. **Admin Order Management**
   - View all orders
   - Update order status
   - Required for fulfillment workflow

9. **Security Hardening**
   - Password hashing (bcrypt)
   - Rate limiting
   - Security headers
   - Required before public launch

10. **CI/CD Pipeline**
    - Automated testing
    - Deployment automation
    - Reduces manual work

### Suggested Architecture Improvements

#### 1. Extract Cart to User-Specific Storage

**Current**: Cart is in-memory (lost on restart)
**Recommendation**: Store cart in user-specific localStorage (like orders) OR database

**Benefit**: Cart persistence across sessions

#### 2. Create Shared Types Package

**Current**: Types duplicated between frontend/backend
**Recommendation**: Create `@night-reader/shared-types` package

**Benefit**: Single source of truth, easier updates

#### 3. Add Backend Validation Layer

**Current**: Zod schemas in middleware
**Recommendation**: Validation service with error standardization

**Benefit**: Consistent error messages, easier testing

#### 4. Implement Backend Caching

**Current**: File reads on every request (with 5s TTL)
**Recommendation**: Redis for product catalog, sessions

**Benefit**: Faster response times, reduced load

### Potential Risks & Mitigation

#### Risk 1: No Testing → Bugs in Production

**Mitigation**: Prioritize unit + integration tests before database migration

#### Risk 2: File-Based Storage Doesn't Scale

**Mitigation**: Plan database migration timeline, test with larger datasets

#### Risk 3: No Payment Integration → Can't Sell

**Mitigation**: Stripe test mode integration ASAP (1-2 weeks max)

#### Risk 4: Responsive Design Missing → Poor Mobile UX

**Mitigation**: Mobile-first CSS refactor in parallel with feature development

### Conclusion

Your project is in **excellent shape** for an MVP. The architecture is clean, type-safe, and well-organized. Your stated documentation goals are the **perfect next step** before scaling. Here's the prioritized roadmap:

**Phase 1: Complete MVP** (2-4 weeks)
1. Checkout + payment (Stripe test mode)
2. Account settings backend
3. Basic testing suite

**Phase 2: Production-Ready** (1-2 months)
4. Database migration (PostgreSQL)
5. Email system
6. Responsive design
7. Security hardening

**Phase 3: Scale & Optimize** (2-3 months)
8. Product search
9. Admin order management
10. CI/CD pipeline
11. Monitoring & logging

**You're ready to move forward!** The documentation you requested is now complete and should serve as a reference for your hands-on development phase.

---

## Appendix: Quick Reference

### Key Commands

**Backend**:
```bash
cd backend
npm install
npm run dev      # Start with nodemon (auto-reload)
npm run build    # Compile TypeScript
npm start        # Run compiled JS
```

**Frontend**:
```bash
cd frontend
npm install
npm start        # Dev server on :5000
npm run build    # Production build
```

### Key URLs

- Frontend: http://localhost:5000
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/api/health

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| demo@nightreader.com | demo123 | user |
| admin@nightreader.com | admin123 | admin |

### API Endpoints Quick Reference

**Auth**:
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register
- GET `/api/auth/me` - Get current user (requires auth)
- POST `/api/auth/logout` - Logout

**Cart**:
- GET `/api/cart` - Get user's cart
- POST `/api/cart/add` - Add item
- PUT `/api/cart/update/:itemId` - Update quantity
- DELETE `/api/cart/remove/:itemId` - Remove item
- DELETE `/api/cart/clear` - Clear cart

**Products**:
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product by ID
- GET `/api/products/catalog` - Get catalog metadata

**Admin (Demo Mode)**:
- GET `/api/demo/admin/products` - List products
- PATCH `/api/demo/admin/products/:id/stock` - Update stock
- PATCH `/api/demo/admin/products/:id/badges` - Toggle badge
- GET `/api/demo/admin/users` - List all users
- GET `/api/demo/admin/users/:userId` - Get user details

### Environment Variables (.env)

```bash
NODE_ENV=development
PORT=3000
DEMO_MODE=true
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:5000
JWT_SECRET=<your-32-char-secret>
JWT_EXPIRY=24h
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-27
**Project Status**: Post Phase 2 Cleanup → Hands-On Development
