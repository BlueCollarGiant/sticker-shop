# Frontend Architecture

## Overview

The Sticker Shop frontend is built with **Angular 20**, leveraging modern features like signals, standalone components, and reactive patterns. This document outlines the overall structure, design principles, and architectural decisions that guide frontend development.

The frontend serves as an e-commerce platform for browsing and purchasing stickers, with additional admin capabilities for managing inventory, orders, and users.

## Core Principles

### 1. Signal-First Design
We use Angular signals as the primary state management mechanism, moving away from RxJS observables where possible.

**Why signals?**
- Simpler mental model (synchronous vs async)
- Better performance (fine-grained reactivity)
- Easier debugging (no subscription management)
- Future-proof (Angular's direction)

**When to use signals:**
- ✅ Component state
- ✅ Shared state (stores)
- ✅ Computed values
- ✅ Effects for side effects

**When to use RxJS:**
- 🔄 HTTP requests
- 🔄 Complex async operations
- 🔄 Debouncing/throttling (combined with signals)

### 2. Standalone Components
All components are standalone (no NgModules except AppModule/routing).

**Benefits:**
- Smaller bundles (tree-shakable)
- Explicit dependencies (imports array)
- Simpler mental model
- Easier testing

### 3. Domain-Driven Folder Structure
Code is organized by feature/domain, not by technical role.

**Good:**
```
src/app/features/auth/
  auth.store.ts
  login.component.ts
  signup.component.ts
```

**Bad:**
```
src/app/components/
src/app/services/
src/app/stores/
```

## Directory Structure

```
frontend/src/app/
│
├── core/                      # Core infrastructure (singleton services, guards, interceptors)
│   ├── guards/
│   ├── interceptors/
│   └── search/               # Search engine system (moved from shared)
│
├── features/                  # Feature modules (domain-driven)
│   ├── auth/                 # Authentication feature
│   │   ├── auth.store.ts     # Auth state management
│   │   ├── login/
│   │   └── signup/
│   ├── products/             # Product browsing
│   ├── cart/                 # Shopping cart
│   ├── orders/               # Order management
│   └── admin/                # Admin panel
│
├── components/               # Shared UI components
│   ├── header/
│   ├── footer/
│   └── admin/               # TODO: Move to features/admin
│
├── services/                 # Shared services
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── admin.service.ts
│
├── models/                   # TypeScript interfaces/types
│   ├── user.model.ts
│   ├── product.model.ts
│   └── order.model.ts
│
├── shared/                   # Shared utilities/helpers
│   └── utils/
│
└── app.routes.ts            # Application routing
```

TODO: Refactor `components/admin` to `features/admin`

## Routing Architecture

### Route Structure
```typescript
// Lazy-loaded feature routes
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', loadChildren: () => import('./features/products/routes') },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component') },
  { path: 'admin', canActivate: [AuthGuard], loadChildren: ... },
];
```

### Guard Strategy
- **AuthGuard** - Protects authenticated routes
- **AdminGuard** - Protects admin-only routes
- **Functional guards** - Prefer standalone functions over class-based guards

TODO: Document lazy loading strategy and code splitting approach

## State Management Strategy

### Local State (Component-Level)
Use signals for component-specific state:

```typescript
export class ProductDetailComponent {
  product = signal<Product | null>(null);
  quantity = signal(1);
  isLoading = signal(false);

  totalPrice = computed(() => {
    const p = this.product();
    return p ? p.price * this.quantity() : 0;
  });
}
```

### Global State (Application-Level)
Use store classes with signals for shared state:

```typescript
// auth.store.ts
export class AuthStore {
  private userSignal = signal<User | null>(null);

  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => this.user() !== null);

  setUser(user: User) {
    this.userSignal.set(user);
  }
}
```

See [State Management](./state-management.md) for detailed patterns.

## Component Architecture

### Component Types

1. **Feature Components** - Smart components that orchestrate data
2. **Presentational Components** - Dumb components that display data
3. **Layout Components** - Structural components (header, footer, etc.)

### Component Template
```typescript
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {
  // Injected dependencies
  private service = inject(ExampleService);

  // Signals
  data = signal<Data[]>([]);
  isLoading = signal(false);

  // Computed values
  filteredData = computed(() => {
    // Reactive computation
  });

  // Methods
  loadData() {
    this.isLoading.set(true);
    this.service.getData().subscribe(data => {
      this.data.set(data);
      this.isLoading.set(false);
    });
  }
}
```

See [Components](./components.md) for detailed guidelines.

## Data Flow Patterns

### Top-Down Data Flow
```
Store (Signal)
    ↓
Component (Computed)
    ↓
Child Component (Input)
    ↓
Grandchild Component (Input)
```

### Event Bubbling
```
Child Component (Output)
    ↓
Parent Component (Event Handler)
    ↓
Store (Update Signal)
```

### Service Communication
```
Component A
    ↓
Service (Method Call)
    ↓
HTTP Request
    ↓
Service (Signal Update)
    ↓
Component B (Computed Reacts)
```

## Styling Architecture

### CSS Strategy
- **Component-scoped styles** - Default Angular encapsulation
- **Global styles** - `src/styles.css` for app-wide rules
- **CSS variables** - Theme colors and spacing
- **BEM-like naming** - `.component__element--modifier`

### Theme System
TODO: Document color palette, spacing scale, typography system

Example:
```css
:root {
  --primary-color: #c9a961;
  --background: #0a1628;
  --text-primary: #e8dcc4;
  --spacing-unit: 1rem;
}
```

## Performance Considerations

### Change Detection
- Use `OnPush` change detection where appropriate
- Signals provide fine-grained reactivity (automatic optimization)

### Lazy Loading
- Feature routes are lazy-loaded
- Heavy components use dynamic imports

### Bundle Optimization
- Standalone components enable tree-shaking
- Avoid importing entire libraries (use specific imports)

### Image Optimization
TODO: Implement Angular image directive for product images

## Build & Deployment

### Development
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # Lint code
```

### Production Build
```bash
npm run build
# Output: dist/frontend
```

TODO: Document deployment strategy (static hosting, CDN, etc.)

## Testing Strategy

### Unit Tests
- Test components in isolation
- Mock services and dependencies
- Use signal testing utilities

### Integration Tests
TODO: Document integration testing approach

### E2E Tests
TODO: Document E2E testing strategy (Playwright, Cypress, etc.)

## Browser Support

**Target browsers:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Polyfills:**
TODO: Document required polyfills

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @angular/core | 20.x | Core framework |
| @angular/router | 20.x | Routing |
| @angular/common | 20.x | Common utilities |
| rxjs | 7.x | Reactive programming |

TODO: Add complete dependency list with justifications

## Architecture Decisions

### ADR-001: Signal-First State Management
**Decision:** Use signals as primary state management mechanism

**Rationale:**
- Angular's recommended approach
- Better performance than Observables for synchronous state
- Simpler mental model for developers
- Future-proof

**Consequences:**
- Requires learning new patterns
- Some RxJS knowledge still needed for async operations
- Must refactor older Observable-based code gradually

### ADR-002: Standalone Components Only
**Decision:** All new components must be standalone

**Rationale:**
- Angular's future direction (NgModules deprecated)
- Better tree-shaking and bundle sizes
- Explicit dependencies easier to understand

**Consequences:**
- Cannot use NgModules for lazy loading
- Must use functional guards/interceptors

TODO: Add more architecture decision records

## Migration Guide

### From Old Patterns to New

**NgModel → Signals:**
```typescript
// Old
searchQuery = '';

// New
searchQuery = signal('');
```

**Services with BehaviorSubject → Signal Stores:**
```typescript
// Old
class AuthService {
  private user$ = new BehaviorSubject<User | null>(null);
  getUser() { return this.user$.asObservable(); }
}

// New
class AuthStore {
  private userSignal = signal<User | null>(null);
  user = this.userSignal.asReadonly();
}
```

TODO: Add comprehensive migration patterns

## Known Issues & Technical Debt

1. **Admin components still in `/components`** - Should move to `/features/admin`
2. **Mixed signal/observable patterns** - Some services still use RxJS heavily
3. **No comprehensive testing** - Test coverage needs improvement
4. **Image optimization missing** - Product images not optimized

See [Roadmap](../shared/roadmap.md) for planned improvements.

## Related Documentation

- [Search Engine](./search-engine.md) - Deep dive into search system
- [State Management](./state-management.md) - Signal patterns and stores
- [Components](./components.md) - Component guidelines
- [Routing](./routing.md) - Navigation and guards
- [Conventions](../shared/conventions.md) - Naming and file organization

---

**Last Updated:** December 2025
