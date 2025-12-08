# Code Style

## Overview

Formatting and linting rules for consistent code style across the Sticker Shop project.

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## ESLint Configuration

TODO: Add ESLint rules

## TypeScript Style

### Type Annotations

```typescript
// ✅ Inferred types
const count = signal(0);  // Type: WritableSignal<number>
const name = 'John';      // Type: string

// ✅ Explicit when needed
function getUser(id: string): Promise<User> { }

// ❌ Redundant
const count: number = 0;
```

### Interfaces vs Types

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
}

// Use types for unions, intersections, utilities
type Status = 'pending' | 'active' | 'complete';
type PartialUser = Partial<User>;
```

## CSS/SCSS Style

### Formatting

```css
/* ✅ Good */
.product-card {
  display: flex;
  padding: 1rem;
  border-radius: 8px;
}

/* ❌ Bad */
.product-card{display:flex;padding:1rem;border-radius:8px;}
```

### Naming

```css
/* Use BEM-like naming */
.block { }
.block__element { }
.block__element--modifier { }

/* Use CSS variables */
.button {
  background: var(--primary);
  color: var(--text-primary);
}
```

## HTML/Template Style

```html
<!-- ✅ Good - indented, readable -->
<div class="container">
  <h1>{{ title() }}</h1>
  @if (items().length > 0) {
    <ul>
      @for (item of items(); track item.id) {
        <li>{{ item.name }}</li>
      }
    </ul>
  }
</div>

<!-- ❌ Bad - unformatted -->
<div class="container"><h1>{{ title() }}</h1>@if (items().length > 0) {<ul>@for (item of items(); track item.id) {<li>{{ item.name }}</li>}</ul>}</div>
```

## File Length Guidelines

- **Components**: ~200 lines max (split if larger)
- **Templates**: ~100 lines max
- **Services**: ~300 lines max
- **Functions**: ~50 lines max

## Best Practices

### Avoid Magic Numbers

```typescript
// ❌ Bad
setTimeout(() => { }, 200);

// ✅ Good
const DEBOUNCE_MS = 200;
setTimeout(() => { }, DEBOUNCE_MS);
```

### Use Descriptive Names

```typescript
// ❌ Bad
const d = new Date();
function calc(a, b) { }

// ✅ Good
const currentDate = new Date();
function calculateTotal(price, quantity) { }
```

### Keep It Simple

```typescript
// ❌ Bad - overly complex
const isValid = user && user.email && user.email.length > 0 && user.email.includes('@') ? true : false;

// ✅ Good - clear and simple
const isValid = user?.email?.includes('@') ?? false;
```

## Auto-formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

**Last Updated:** December 2025
