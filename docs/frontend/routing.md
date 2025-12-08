# Routing

## Overview

The Sticker Shop uses Angular's standalone routing API with lazy-loading and route guards for navigation and access control. This document covers routing configuration, navigation patterns, and best practices.

## Route Configuration

### App Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },

  // Products
  {
    path: 'products',
    loadChildren: () => import('./features/products/routes')
      .then(m => m.PRODUCT_ROUTES)
  },

  // Product Detail
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent)
  },

  // Auth Routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component')
      .then(m => m.SignupComponent)
  },

  // Protected Routes
  {
    path: 'cart',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/cart/cart.component')
      .then(m => m.CartComponent)
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/orders/routes')
      .then(m => m.ORDER_ROUTES)
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./features/admin/routes')
      .then(m => m.ADMIN_ROUTES)
  },

  // 404 Not Found
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
```

### Feature Routes

```typescript
// features/products/routes.ts
import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent)
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./product-list/product-list.component')
      .then(m => m.ProductListComponent)
  }
];
```

## Route Guards

### Functional Guards (Recommended)

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../../features/auth/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

### Admin Guard

```typescript
// core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../../features/auth/auth.store';

export const adminGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAdmin()) {
    return true;
  }

  // Redirect to home if not admin
  return router.createUrlTree(['/']);
};
```

### Unsaved Changes Guard

```typescript
// core/guards/unsaved-changes.guard.ts
import { CanDeactivateFn } from '@angular/router';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (component) => {
  if (component.canDeactivate && !component.canDeactivate()) {
    return confirm('You have unsaved changes. Do you really want to leave?');
  }
  return true;
};

// Usage in component
export class EditComponent implements ComponentCanDeactivate {
  hasUnsavedChanges = signal(false);

  canDeactivate(): boolean {
    return !this.hasUnsavedChanges();
  }
}
```

## Navigation

### Programmatic Navigation

```typescript
import { Router } from '@angular/router';

export class ExampleComponent {
  private router = inject(Router);

  // Simple navigation
  goToProducts() {
    this.router.navigate(['/products']);
  }

  // Navigate with parameters
  goToProduct(id: string) {
    this.router.navigate(['/products', id]);
  }

  // Navigate with query params
  searchProducts(query: string) {
    this.router.navigate(['/products'], {
      queryParams: { search: query }
    });
  }

  // Replace current URL (no history entry)
  replaceUrl() {
    this.router.navigate(['/products'], {
      replaceUrl: true
    });
  }

  // Navigate relative to current route
  goToEdit() {
    this.router.navigate(['edit'], {
      relativeTo: this.activatedRoute
    });
  }
}
```

### Template Navigation

```html
<!-- Simple link -->
<a routerLink="/products">Products</a>

<!-- Link with parameter -->
<a [routerLink]="['/products', product.id]">View</a>

<!-- Link with query params -->
<a
  routerLink="/products"
  [queryParams]="{ category: 'stickers' }"
>
  Stickers
</a>

<!-- Active link styling -->
<a
  routerLink="/products"
  routerLinkActive="active"
  [routerLinkActiveOptions]="{ exact: true }"
>
  Products
</a>

<!-- Navigate on click -->
<button (click)="router.navigate(['/cart'])">
  View Cart
</button>
```

## Route Parameters

### Reading Route Params

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export class ProductDetailComponent {
  private route = inject(ActivatedRoute);

  productId = signal<string>('');

  ngOnInit() {
    // Get param from snapshot (non-reactive)
    const id = this.route.snapshot.paramMap.get('id');
    this.productId.set(id || '');

    // Subscribe to param changes (reactive)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.productId.set(id || '');
      this.loadProduct(id);
    });
  }

  loadProduct(id: string | null) {
    if (!id) return;
    // Load product logic
  }
}
```

### Reading Query Params

```typescript
export class ProductListComponent {
  private route = inject(ActivatedRoute);

  searchQuery = signal('');
  category = signal('');

  ngOnInit() {
    // Subscribe to query param changes
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery.set(params.get('search') || '');
      this.category.set(params.get('category') || '');
      this.loadProducts();
    });
  }
}
```

### Converting to Signals (Angular 20)

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

export class ProductDetailComponent {
  private route = inject(ActivatedRoute);

  // Convert Observable to Signal
  productId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') || '')
    ),
    { initialValue: '' }
  );

  // Use in effect or computed
  constructor() {
    effect(() => {
      const id = this.productId();
      if (id) {
        this.loadProduct(id);
      }
    });
  }
}
```

## Lazy Loading

### Feature Module Lazy Loading

```typescript
{
  path: 'products',
  loadChildren: () => import('./features/products/routes')
    .then(m => m.PRODUCT_ROUTES)
}
```

### Component Lazy Loading

```typescript
{
  path: 'about',
  loadComponent: () => import('./features/about/about.component')
    .then(m => m.AboutComponent)
}
```

### Preloading Strategy

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ]
};
```

TODO: Implement custom preloading strategy for priority routes

## Route Data & Resolvers

### Static Route Data

```typescript
{
  path: 'about',
  loadComponent: () => import('./about/about.component'),
  data: {
    title: 'About Us',
    breadcrumb: 'About'
  }
}

// Access in component
export class AboutComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const title = this.route.snapshot.data['title'];
    console.log(title);  // 'About Us'
  }
}
```

### Route Resolvers (Functional)

```typescript
// resolvers/product.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProductService } from '../services/product.service';

export const productResolver: ResolveFn<Product> = (route, state) => {
  const productService = inject(ProductService);
  const id = route.paramMap.get('id');

  if (!id) throw new Error('Product ID required');

  return productService.getById(id);
};

// Route configuration
{
  path: 'products/:id',
  loadComponent: () => import('./product-detail/product-detail.component'),
  resolve: {
    product: productResolver
  }
}

// Component
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);

  ngOnInit() {
    const product = this.route.snapshot.data['product'];
    this.product.set(product);
  }
}
```

## Navigation Events

### Listening to Router Events

```typescript
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

export class AppComponent {
  private router = inject(Router);

  isNavigating = signal(false);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating.set(true);
      }

      if (event instanceof NavigationEnd) {
        this.isNavigating.set(false);
        // Track page view
        this.trackPageView(event.url);
      }
    });
  }

  trackPageView(url: string) {
    // Analytics logic
  }
}
```

## URL Strategy

### Hash Location Strategy

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation())
  ]
};

// URLs: example.com/#/products
```

### Path Location Strategy (Default)

```typescript
// URLs: example.com/products
```

TODO: Configure server for HTML5 mode (return index.html for all routes)

## Best Practices

### ✅ Do's

1. **Use lazy loading for features**
   ```typescript
   loadChildren: () => import('./feature/routes')
   ```

2. **Use functional guards**
   ```typescript
   canActivate: [authGuard]
   ```

3. **Handle navigation errors**
   ```typescript
   this.router.navigate(['/products']).catch(err => {
     console.error('Navigation failed:', err);
   });
   ```

4. **Unsubscribe in component destroy**
   ```typescript
   ngOnDestroy() {
     this.subscription.unsubscribe();
   }
   ```

5. **Use route data for metadata**
   ```typescript
   data: { title: 'Products', requiresAuth: true }
   ```

### ❌ Don'ts

1. **Don't forget to handle route params reactively**
   ```typescript
   // Bad - only runs once
   const id = this.route.snapshot.paramMap.get('id');

   // Good - reacts to param changes
   this.route.paramMap.subscribe(params => {
     const id = params.get('id');
   });
   ```

2. **Don't hardcode URLs**
   ```typescript
   // Bad
   window.location.href = '/products';

   // Good
   this.router.navigate(['/products']);
   ```

3. **Don't use router without checks**
   ```typescript
   // Bad
   this.router.navigate(['/products']);

   // Good
   this.router.navigate(['/products']).then(success => {
     if (success) {
       console.log('Navigation successful');
     }
   });
   ```

## Common Patterns

### Redirect After Login

```typescript
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  login() {
    this.authService.login(credentials).subscribe(success => {
      if (success) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }
}
```

### Breadcrumbs

```typescript
export class BreadcrumbComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  breadcrumbs = signal<Breadcrumb[]>([]);

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.breadcrumbs.set(this.createBreadcrumbs(this.route.root));
      }
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
```

## Testing

TODO: Document routing testing strategies

## Related Documentation

- [Architecture](./architecture.md) - Overall structure
- [Components](./components.md) - Component patterns

---

**Last Updated:** December 2025
