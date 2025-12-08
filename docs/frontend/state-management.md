# State Management

## Overview

State management in the Sticker Shop frontend uses **Angular signals** as the primary mechanism. This document covers patterns, best practices, and examples for managing both local and global state.

Signals provide a reactive, synchronous state management solution that's simpler than RxJS observables for most use cases while offering better performance through fine-grained reactivity.

## Core Concepts

### What Are Signals?

Signals are reactive primitives that notify consumers when their value changes.

```typescript
import { signal, computed, effect } from '@angular/core';

// Create a signal
const count = signal(0);

// Read a signal
console.log(count());  // 0

// Write a signal
count.set(5);
count.update(n => n + 1);  // Increment

// Computed signal (derived state)
const doubleCount = computed(() => count() * 2);

// Effect (side effect when signals change)
effect(() => {
  console.log('Count changed to:', count());
});
```

### Signal Types

1. **Writable Signals** - Can be modified
   ```typescript
   const name = signal('John');
   name.set('Jane');
   ```

2. **Read-only Signals** - Cannot be modified externally
   ```typescript
   const writableName = signal('John');
   const readonlyName = writableName.asReadonly();
   // readonlyName.set('Jane');  // Error!
   ```

3. **Computed Signals** - Derived from other signals
   ```typescript
   const firstName = signal('John');
   const lastName = signal('Doe');
   const fullName = computed(() => `${firstName()} ${lastName()}`);
   ```

## Local State (Component-Level)

### Basic Component State

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  template: `
    <div>
      <h1>{{ product()?.title }}</h1>
      <p>Price: ${{ product()?.price }}</p>

      <div>
        <button (click)="decrementQuantity()">-</button>
        <span>{{ quantity() }}</span>
        <button (click)="incrementQuantity()">+</button>
      </div>

      <p>Total: ${{ totalPrice() }}</p>

      <button (click)="addToCart()" [disabled]="isLoading()">
        {{ isLoading() ? 'Adding...' : 'Add to Cart' }}
      </button>
    </div>
  `
})
export class ProductDetailComponent {
  // State signals
  product = signal<Product | null>(null);
  quantity = signal(1);
  isLoading = signal(false);

  // Computed values
  totalPrice = computed(() => {
    const p = this.product();
    return p ? p.price * this.quantity() : 0;
  });

  // Methods
  incrementQuantity() {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity() {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  addToCart() {
    this.isLoading.set(true);
    // ... add to cart logic
  }
}
```

### Form State

```typescript
@Component({
  selector: 'app-signup-form',
  template: `
    <form>
      <input
        type="email"
        [value]="email()"
        (input)="email.set($any($event.target).value)"
      />
      <input
        type="password"
        [value]="password()"
        (input)="password.set($any($event.target).value)"
      />

      <p *ngIf="errorMessage()">{{ errorMessage() }}</p>

      <button
        (click)="submit()"
        [disabled]="!isValid()"
      >
        Sign Up
      </button>
    </form>
  `
})
export class SignupFormComponent {
  // Form field signals
  email = signal('');
  password = signal('');
  errorMessage = signal('');

  // Validation
  isValid = computed(() => {
    const emailValid = this.email().includes('@');
    const passwordValid = this.password().length >= 8;
    return emailValid && passwordValid;
  });

  submit() {
    if (!this.isValid()) return;
    // ... submit logic
  }
}
```

## Global State (Stores)

### Store Pattern

Create injectable classes with signals for global state:

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartStore {
  // Private writable signal
  private itemsSignal = signal<CartItem[]>([]);

  // Public read-only access
  items = this.itemsSignal.asReadonly();

  // Computed values
  totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  totalPrice = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  isEmpty = computed(() => this.items().length === 0);

  // Methods
  addItem(product: Product, quantity: number = 1) {
    this.itemsSignal.update(items => {
      const existing = items.find(i => i.productId === product.id);

      if (existing) {
        return items.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...items, {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity
      }];
    });
  }

  removeItem(productId: string) {
    this.itemsSignal.update(items =>
      items.filter(i => i.productId !== productId)
    );
  }

  updateQuantity(productId: string, quantity: number) {
    this.itemsSignal.update(items =>
      items.map(i =>
        i.productId === productId
          ? { ...i, quantity }
          : i
      )
    );
  }

  clear() {
    this.itemsSignal.set([]);
  }
}
```

### Using Stores in Components

```typescript
import { Component, inject } from '@angular/core';
import { CartStore } from './cart.store';

@Component({
  selector: 'app-cart',
  template: `
    <div *ngIf="cart.isEmpty(); else cartContent">
      <p>Your cart is empty</p>
    </div>

    <ng-template #cartContent>
      <h2>Cart ({{ cart.totalItems() }} items)</h2>

      <div *ngFor="let item of cart.items()">
        <h3>{{ item.title }}</h3>
        <p>${{ item.price }} × {{ item.quantity }}</p>
        <button (click)="cart.removeItem(item.productId)">Remove</button>
      </div>

      <h3>Total: ${{ cart.totalPrice() }}</h3>
      <button (click)="checkout()">Checkout</button>
    </ng-template>
  `
})
export class CartComponent {
  cart = inject(CartStore);

  checkout() {
    // ... checkout logic
  }
}
```

### Auth Store Example

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private userSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Public read-only signals
  user = this.userSignal.asReadonly();
  token = this.tokenSignal.asReadonly();

  // Computed state
  isAuthenticated = computed(() => this.user() !== null);
  isAdmin = computed(() => this.user()?.role === 'admin');

  // Methods
  setUser(user: User) {
    this.userSignal.set(user);
  }

  setToken(token: string) {
    this.tokenSignal.set(token);
    localStorage.setItem('token', token);
  }

  logout() {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem('token');
  }

  // Initialize from localStorage
  initializeFromStorage() {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenSignal.set(token);
      // Validate token and fetch user...
    }
  }
}
```

## Combining Signals with RxJS

### HTTP Requests with Signals

```typescript
import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-products',
  template: `
    <div *ngIf="isLoading()">Loading...</div>
    <div *ngIf="error()">Error: {{ error() }}</div>

    <div *ngFor="let product of products()">
      {{ product.title }}
    </div>
  `
})
export class ProductsComponent {
  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<Product[]>('/api/products').subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      }
    });
  }
}
```

### Debouncing with RxJS + Signals

```typescript
import { Component, signal, effect, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  template: `
    <input
      [value]="query()"
      (input)="onInput($event)"
    />
    <div>Searching for: {{ debouncedQuery() }}</div>
  `
})
export class SearchComponent {
  query = signal('');
  debouncedQuery = signal('');

  private querySubject = new Subject<string>();

  constructor() {
    // Setup debouncing
    this.querySubject
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.debouncedQuery.set(value);
      });

    // Sync query to subject
    effect(() => {
      this.querySubject.next(this.query());
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
  }

  ngOnDestroy() {
    this.querySubject.complete();
  }
}
```

## Effects for Side Effects

### Basic Effect

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-theme',
  template: `<button (click)="toggleTheme()">Toggle Theme</button>`
})
export class ThemeComponent {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    // Apply theme to DOM when it changes
    effect(() => {
      document.body.className = this.theme();
    });
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
```

### Effect with Cleanup

```typescript
import { Component, signal, effect } from '@angular/core';

@Component({
  selector: 'app-auto-save',
  template: `<textarea [(ngModel)]="content"></textarea>`
})
export class AutoSaveComponent {
  content = signal('');

  constructor() {
    effect((onCleanup) => {
      const value = this.content();

      const timeoutId = setTimeout(() => {
        this.saveToServer(value);
      }, 1000);

      // Cleanup function
      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  saveToServer(content: string) {
    // Save logic
  }
}
```

## Advanced Patterns

### Normalized State

```typescript
interface NormalizedState<T> {
  ids: string[];
  entities: Record<string, T>;
}

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private stateSignal = signal<NormalizedState<Product>>({
    ids: [],
    entities: {}
  });

  // Computed selectors
  allProducts = computed(() => {
    const state = this.stateSignal();
    return state.ids.map(id => state.entities[id]);
  });

  getProductById(id: string) {
    return computed(() => this.stateSignal().entities[id]);
  }

  // Methods
  setProducts(products: Product[]) {
    this.stateSignal.set({
      ids: products.map(p => p.id),
      entities: products.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, Product>)
    });
  }

  updateProduct(id: string, changes: Partial<Product>) {
    this.stateSignal.update(state => ({
      ...state,
      entities: {
        ...state.entities,
        [id]: { ...state.entities[id], ...changes }
      }
    }));
  }
}
```

### Composing Stores

```typescript
@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  private cart = inject(CartStore);
  private auth = inject(AuthStore);

  canCheckout = computed(() => {
    return this.auth.isAuthenticated() && !this.cart.isEmpty();
  });

  totalWithTax = computed(() => {
    const subtotal = this.cart.totalPrice();
    const taxRate = 0.08;
    return subtotal * (1 + taxRate);
  });
}
```

## Best Practices

### ✅ Do's

1. **Use signals for synchronous state**
   ```typescript
   const count = signal(0);
   ```

2. **Make internal signals private**
   ```typescript
   private userSignal = signal<User | null>(null);
   user = this.userSignal.asReadonly();
   ```

3. **Use computed for derived state**
   ```typescript
   fullName = computed(() => `${firstName()} ${lastName()}`);
   ```

4. **Update signals immutably**
   ```typescript
   items.update(list => [...list, newItem]);
   ```

5. **Use effects for side effects only**
   ```typescript
   effect(() => {
     localStorage.setItem('theme', theme());
   });
   ```

### ❌ Don'ts

1. **Don't mutate signal values directly**
   ```typescript
   // Bad
   const items = signal([1, 2, 3]);
   items().push(4);  // Mutation!

   // Good
   items.update(list => [...list, 4]);
   ```

2. **Don't use effects for derived state**
   ```typescript
   // Bad
   effect(() => {
     total.set(price() * quantity());
   });

   // Good
   total = computed(() => price() * quantity());
   ```

3. **Don't expose writable signals from stores**
   ```typescript
   // Bad
   export class Store {
     items = signal([]);  // Public and writable!
   }

   // Good
   export class Store {
     private itemsSignal = signal([]);
     items = this.itemsSignal.asReadonly();
   }
   ```

4. **Don't create circular dependencies**
   ```typescript
   // Bad
   const a = signal(0);
   const b = computed(() => a() + c());
   const c = computed(() => b() + 1);  // Circular!
   ```

## Migration from RxJS

### BehaviorSubject → Signal

```typescript
// Before
class Store {
  private user$ = new BehaviorSubject<User | null>(null);

  getUser() {
    return this.user$.asObservable();
  }

  setUser(user: User) {
    this.user$.next(user);
  }
}

// After
class Store {
  private userSignal = signal<User | null>(null);

  user = this.userSignal.asReadonly();

  setUser(user: User) {
    this.userSignal.set(user);
  }
}
```

### CombineLatest → Computed

```typescript
// Before
user$ = new BehaviorSubject<User | null>(null);
cart$ = new BehaviorSubject<Cart>({ items: [] });

canCheckout$ = combineLatest([this.user$, this.cart$]).pipe(
  map(([user, cart]) => user !== null && cart.items.length > 0)
);

// After
user = signal<User | null>(null);
cart = signal<Cart>({ items: [] });

canCheckout = computed(() =>
  this.user() !== null && this.cart().items.length > 0
);
```

## Testing

### Testing Components with Signals

```typescript
describe('ProductDetailComponent', () => {
  it('should calculate total price', () => {
    const component = new ProductDetailComponent();

    component.product.set({ id: '1', price: 10 });
    component.quantity.set(3);

    expect(component.totalPrice()).toBe(30);
  });

  it('should update quantity', () => {
    const component = new ProductDetailComponent();

    component.quantity.set(1);
    component.incrementQuantity();

    expect(component.quantity()).toBe(2);
  });
});
```

### Testing Stores

```typescript
describe('CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    store = new CartStore();
  });

  it('should add items', () => {
    const product = { id: '1', title: 'Test', price: 10 };

    store.addItem(product, 2);

    expect(store.items().length).toBe(1);
    expect(store.totalItems()).toBe(2);
    expect(store.totalPrice()).toBe(20);
  });

  it('should remove items', () => {
    const product = { id: '1', title: 'Test', price: 10 };

    store.addItem(product, 1);
    store.removeItem('1');

    expect(store.isEmpty()).toBe(true);
  });
});
```

## Common Patterns

See [Search Engine](./search-engine.md) for a real-world example of signals + RxJS + computed values.

## Related Documentation

- [Architecture](./architecture.md) - Overall frontend structure
- [Search Engine](./search-engine.md) - Complex signal-based system
- [Components](./components.md) - Component patterns

---

**Last Updated:** December 2025
