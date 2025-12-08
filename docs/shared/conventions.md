# Conventions

## Overview

Naming conventions, file structure patterns, and workflow guidelines for the Sticker Shop project.

## Naming Conventions

### Files & Folders

**Components** (Angular)
```
product-card.component.ts
product-card.component.html
product-card.component.css
```

**Services**
```
product.service.ts
auth.service.ts
```

**Stores**
```
cart.store.ts
auth.store.ts
```

**Routes**
```
app.routes.ts
products/routes.ts
```

**Backend Files**
```
auth.routes.js
auth.controller.js
auth.service.js
User.model.js
```

### Variables & Functions

**TypeScript/JavaScript**
```typescript
// camelCase for variables and functions
const userName = 'John';
function getUserById(id: string) { }

// PascalCase for classes and types
class UserService { }
interface Product { }
type OrderStatus = 'pending' | 'complete';

// UPPER_SNAKE_CASE for constants
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'https://api.example.com';

// Prefix booleans with is/has/can
const isLoading = signal(false);
const hasPermission = computed(() => user()?.role === 'admin');
```

**CSS Classes**
```css
/* BEM-like naming */
.product-card { }
.product-card__title { }
.product-card__title--highlighted { }

/* Utility classes */
.text-center { }
.mt-4 { }
.flex { }
```

### Git Conventions

**Branch Names**
```
main                    # Production branch
develop                 # Development branch
feature/search-engine   # New features
fix/cart-total-bug     # Bug fixes
refactor/auth-system   # Code refactoring
docs/api-documentation # Documentation updates
```

**Commit Messages**
```
feat: implement search engine with ranking
fix: resolve cart total calculation error
refactor: move admin components to features
docs: add API endpoint documentation
style: format code with prettier
test: add unit tests for auth service
chore: update dependencies
```

Format: `<type>: <description>`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `docs` - Documentation
- `style` - Code formatting
- `test` - Tests
- `chore` - Maintenance

## File Organization

### Frontend Structure

```
src/app/
├── core/              # Singleton services, guards
├── features/          # Feature modules (domain-driven)
│   ├── auth/
│   ├── products/
│   └── admin/
├── components/        # Shared UI components
├── models/            # TypeScript interfaces
└── shared/            # Utilities, helpers
```

### Backend Structure

```
src/
├── routes/           # API routes
├── controllers/      # Request handlers
├── services/         # Business logic
├── models/           # Data models
├── middleware/       # Custom middleware
├── config/           # Configuration
└── utils/            # Helper functions
```

## Code Organization

### Import Order

```typescript
// 1. Angular/Node core
import { Component } from '@angular/core';
import express from 'express';

// 2. Third-party libraries
import { Subject } from 'rxjs';

// 3. Application imports (absolute)
import { AuthStore } from '@app/features/auth/auth.store';

// 4. Relative imports
import { ProductCard } from './product-card.component';
```

### Component Structure

```typescript
export class ExampleComponent {
  // 1. Injected dependencies
  private service = inject(ExampleService);

  // 2. Inputs
  data = input.required<Data>();

  // 3. Outputs
  clicked = output<void>();

  // 4. State signals
  isLoading = signal(false);

  // 5. Computed values
  filteredData = computed(() => { });

  // 6. Lifecycle hooks
  ngOnInit() { }

  // 7. Public methods
  handleClick() { }

  // 8. Private methods
  private loadData() { }
}
```

## Documentation

### Code Comments

```typescript
// Use comments sparingly - code should be self-documenting

// ✅ Good - explains WHY
// Wait 200ms after typing stops to prevent excessive API calls
const debounceMs = 200;

// ❌ Bad - explains WHAT (code already shows this)
// Set debounce to 200
const debounceMs = 200;

// Use JSDoc for public APIs
/**
 * Creates a search engine instance
 * @param items - Signal containing searchable items
 * @param config - Search configuration
 * @returns Search engine interface
 */
export function createSearchEngine<T>(...) { }
```

### TODO Comments

```typescript
// TODO: Implement pagination
// FIXME: Fix race condition in cart update
// HACK: Temporary workaround for API bug
// NOTE: This must run before authentication
```

## Testing Conventions

### Test File Names

```
product-card.component.spec.ts
auth.service.spec.ts
search-engine.spec.ts
```

### Test Structure

```typescript
describe('ProductCardComponent', () => {
  let component: ProductCardComponent;

  beforeEach(() => {
    // Setup
  });

  describe('initialization', () => {
    it('should display product title', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('user interactions', () => {
    it('should emit event when clicked', () => {
      // Test
    });
  });
});
```

## Pull Request Guidelines

1. **Create descriptive PRs**
   - Clear title: "feat: Add search engine with ranking"
   - Description explains WHAT and WHY
   - Link related issues

2. **Keep PRs focused**
   - One feature/fix per PR
   - Small, reviewable changes
   - Don't mix refactoring with features

3. **Update documentation**
   - Update relevant docs in same PR
   - Add/update tests
   - Update changelog if needed

4. **Code review checklist**
   - ✅ Code follows conventions
   - ✅ Tests pass
   - ✅ Documentation updated
   - ✅ No console.logs left behind
   - ✅ TypeScript errors resolved

## Environment Setup

### Required Tools

- Node.js 20+
- npm or yarn
- Angular CLI 20+
- Git

### Getting Started

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
cd frontend && npm install
cd backend && npm install

# Setup environment
cp .env.example .env

# Run development servers
npm run dev
```

## Related Documentation

- [Glossary](./glossary.md) - Term definitions
- [Code Style](./code-style.md) - Formatting rules
- [Roadmap](./roadmap.md) - Feature planning

---

**Last Updated:** December 2025
