# Components

## Overview

This document outlines component architecture, design patterns, and guidelines for building components in the Sticker Shop frontend. All components use Angular 20's standalone component API with signal-based state management.

## Component Types

### 1. Feature Components (Smart Components)

Feature components orchestrate business logic, manage state, and interact with services.

**Characteristics:**
- Inject services and stores
- Manage local and global state
- Handle routing and navigation
- Coordinate child components
- Contains business logic

**Example:**
```typescript
import { Component, signal, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartStore } from '../cart/cart.store';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="product-grid">
      @for (product of products(); track product.id) {
        <app-product-card
          [product]="product"
          (addToCart)="handleAddToCart($event)"
        />
      }
    </div>
  `
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private cart = inject(CartStore);

  products = signal<Product[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAll().subscribe(data => {
      this.products.set(data);
      this.isLoading.set(false);
    });
  }

  handleAddToCart(product: Product) {
    this.cart.addItem(product, 1);
  }
}
```

### 2. Presentational Components (Dumb Components)

Presentational components display data and emit events. They don't know about services or business logic.

**Characteristics:**
- Receive data via `@Input()`
- Emit events via `@Output()`
- No service injection (usually)
- Reusable across features
- Easy to test

**Example:**
```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <img [src]="product().image" [alt]="product().title" />
      <h3>{{ product().title }}</h3>
      <p>{{ product().description }}</p>
      <span class="price">\${{ product().price }}</span>

      <button (click)="addToCart.emit(product())">
        Add to Cart
      </button>
    </div>
  `,
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  // Input signal (Angular 20+)
  product = input.required<Product>();

  // Output event
  addToCart = output<Product>();
}
```

### 3. Layout Components

Layout components provide structure and don't contain business logic.

**Examples:**
- Header/Navigation
- Footer
- Sidebar
- Page containers

TODO: Document layout component patterns

## Component Structure

### Recommended Template

```typescript
import { Component, signal, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, /* other components */],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {
  // 1. Injected dependencies
  private service = inject(ExampleService);
  private store = inject(ExampleStore);

  // 2. Input signals
  title = input<string>('Default Title');
  items = input.required<Item[]>();

  // 3. Output events
  itemClicked = output<Item>();
  save = output<void>();

  // 4. Local state signals
  isExpanded = signal(false);
  selectedId = signal<string | null>(null);

  // 5. Computed values
  selectedItem = computed(() => {
    const id = this.selectedId();
    return this.items().find(item => item.id === id);
  });

  // 6. Lifecycle hooks
  ngOnInit() {
    // Initialization logic
  }

  ngOnDestroy() {
    // Cleanup logic
  }

  // 7. Event handlers
  handleClick(item: Item) {
    this.selectedId.set(item.id);
    this.itemClicked.emit(item);
  }

  // 8. Helper methods
  private formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}
```

## Input/Output Patterns

### Modern Signal Inputs (Angular 20+)

```typescript
// Required input
product = input.required<Product>();

// Optional input with default
count = input<number>(0);

// Transform input
userId = input<string, string | number>('', {
  transform: (value: string | number) => String(value)
});

// Usage in template
{{ product().title }}
{{ count() }}
```

### Outputs

```typescript
// Basic output
clicked = output<void>();

// Output with data
itemSelected = output<Item>();

// Usage
<button (click)="clicked.emit()">Click</button>
<div (click)="itemSelected.emit(item)">{{ item.name }}</div>
```

## Lifecycle Hooks

### Common Hooks

```typescript
export class ExampleComponent {
  ngOnInit() {
    // Component initialized
    // Good for: API calls, subscriptions
  }

  ngOnDestroy() {
    // Component destroyed
    // Good for: cleanup, unsubscribe
  }

  ngAfterViewInit() {
    // View fully initialized
    // Good for: DOM manipulation, third-party libs
  }
}
```

### With Signals

```typescript
export class ExampleComponent {
  data = signal<Data | null>(null);

  constructor() {
    // Effects run when signals change
    effect(() => {
      console.log('Data changed:', this.data());
    });
  }

  ngOnInit() {
    // Still use ngOnInit for non-reactive initialization
    this.loadData();
  }

  loadData() {
    this.service.getData().subscribe(data => {
      this.data.set(data);  // Triggers effect
    });
  }
}
```

## Template Syntax (Angular 20)

### Control Flow

```html
<!-- If/Else -->
@if (isLoading()) {
  <div>Loading...</div>
} @else if (error()) {
  <div>Error: {{ error() }}</div>
} @else {
  <div>{{ data() }}</div>
}

<!-- For Loop -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>No items found</p>
}

<!-- Switch -->
@switch (status()) {
  @case ('pending') {
    <span>⏳ Pending</span>
  }
  @case ('complete') {
    <span>✅ Complete</span>
  }
  @default {
    <span>Unknown</span>
  }
}
```

### Event Binding

```html
<!-- Click event -->
<button (click)="handleClick()">Click Me</button>

<!-- Input event -->
<input
  [value]="query()"
  (input)="query.set($any($event.target).value)"
/>

<!-- Keyboard events -->
<input
  (keydown)="handleKeyDown($event)"
  (keyup.enter)="handleEnter()"
/>

<!-- Custom events -->
<app-child (itemSelected)="handleSelection($event)" />
```

### Property Binding

```html
<!-- Signal binding -->
<div>{{ count() }}</div>
<img [src]="imageUrl()" [alt]="title()" />

<!-- Class binding -->
<div [class.active]="isActive()">Item</div>
<div [class]="'btn-' + theme()">Button</div>

<!-- Style binding -->
<div [style.color]="textColor()">Text</div>
<div [style.width.px]="width()">Box</div>

<!-- Attribute binding -->
<button [attr.aria-label]="label()">Icon</button>
```

## Component Communication

### Parent → Child (Input)

```typescript
// Parent
@Component({
  template: `<app-child [data]="parentData()" />`
})
export class ParentComponent {
  parentData = signal<string>('Hello from parent');
}

// Child
@Component({
  selector: 'app-child'
})
export class ChildComponent {
  data = input.required<string>();
}
```

### Child → Parent (Output)

```typescript
// Child
@Component({
  selector: 'app-child',
  template: `<button (click)="notify.emit('clicked')">Click</button>`
})
export class ChildComponent {
  notify = output<string>();
}

// Parent
@Component({
  template: `<app-child (notify)="handleNotify($event)" />`
})
export class ParentComponent {
  handleNotify(message: string) {
    console.log('Child said:', message);
  }
}
```

### Sibling Communication (via Store)

```typescript
// Shared store
@Injectable({ providedIn: 'root' })
export class SharedStore {
  message = signal<string>('');
}

// Sibling A
export class SiblingAComponent {
  store = inject(SharedStore);

  sendMessage() {
    this.store.message.set('Hello from A');
  }
}

// Sibling B
export class SiblingBComponent {
  store = inject(SharedStore);

  message = this.store.message;  // Reactive
}
```

## Styling

### Component Styles

```typescript
@Component({
  selector: 'app-card',
  styleUrl: './card.component.css',  // Single file
  // OR
  styleUrls: ['./card.component.css', './card-theme.css']  // Multiple files
})
```

### CSS Encapsulation

```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.Emulated  // Default (scoped)
  // ViewEncapsulation.None      // Global styles
  // ViewEncapsulation.ShadowDom // Shadow DOM
})
```

### Host Bindings

```typescript
@Component({
  selector: 'app-badge',
  host: {
    '[class.active]': 'isActive()',
    '[style.color]': 'color()',
    '(click)': 'handleClick()'
  }
})
export class BadgeComponent {
  isActive = signal(false);
  color = signal('red');

  handleClick() {
    this.isActive.update(v => !v);
  }
}
```

## Best Practices

### ✅ Do's

1. **Keep components focused**
   - One responsibility per component
   - Extract logic into services
   - Use presentational components for reuse

2. **Use signals for state**
   ```typescript
   isLoading = signal(false);
   data = signal<Data[]>([]);
   ```

3. **Use computed for derived state**
   ```typescript
   filteredItems = computed(() =>
     this.items().filter(i => i.active)
   );
   ```

4. **Make components testable**
   - Use dependency injection
   - Avoid complex logic in templates
   - Expose testable methods

5. **Follow naming conventions**
   - Components: `ProductCardComponent`
   - Files: `product-card.component.ts`
   - Selectors: `app-product-card`

### ❌ Don'ts

1. **Don't inject too many services**
   ```typescript
   // Bad - too many dependencies
   constructor(
     service1, service2, service3, service4, service5
   ) {}

   // Good - combine related services into stores
   store = inject(ProductStore);
   ```

2. **Don't put business logic in templates**
   ```html
   <!-- Bad -->
   {{ items.filter(i => i.price > 10).map(i => i.title).join(', ') }}

   <!-- Good -->
   {{ expensiveItemTitles() }}
   ```

3. **Don't mutate inputs**
   ```typescript
   product = input.required<Product>();

   // Bad
   modifyProduct() {
     this.product().price = 100;  // Mutation!
   }

   // Good
   modifyProduct() {
     this.priceChanged.emit({ id: this.product().id, price: 100 });
   }
   ```

4. **Don't create large monolithic components**
   - Break into smaller components
   - Extract reusable pieces
   - Keep template files under 100 lines

## Common Patterns

### Loading States

```typescript
@Component({
  template: `
    @if (isLoading()) {
      <div class="spinner">Loading...</div>
    } @else if (error()) {
      <div class="error">{{ error() }}</div>
    } @else {
      <div>{{ data() }}</div>
    }
  `
})
export class DataComponent {
  data = signal<Data | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getData().subscribe({
      next: (data) => {
        this.data.set(data);
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

### Conditional Rendering

```typescript
@Component({
  template: `
    @if (user(); as u) {
      <div>Welcome, {{ u.name }}!</div>
    } @else {
      <button (click)="login()">Login</button>
    }
  `
})
```

### List Rendering with Track

```typescript
@Component({
  template: `
    @for (item of items(); track item.id) {
      <div>{{ item.name }}</div>
    }

    <!-- Track by index -->
    @for (item of items(); track $index) {
      <div>{{ item }}</div>
    }
  `
})
```

## Testing

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
  });

  it('should display product title', () => {
    const product = { id: '1', title: 'Test Product', price: 10 };
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent).toBe('Test Product');
  });

  it('should emit addToCart event', () => {
    const product = { id: '1', title: 'Test', price: 10 };
    fixture.componentRef.setInput('product', product);

    let emittedProduct: Product | undefined;
    component.addToCart.subscribe(p => emittedProduct = p);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emittedProduct).toEqual(product);
  });
});
```

## Component Library

TODO: Document reusable component library

**Planned components:**
- Button variants
- Input fields
- Cards
- Modals
- Dropdowns
- Loaders
- Badges
- Alerts

## Related Documentation

- [Architecture](./architecture.md) - Overall structure
- [State Management](./state-management.md) - Signal patterns
- [UI/UX Guidelines](./ui-ux-guidelines.md) - Design system

---

**Last Updated:** December 2025
