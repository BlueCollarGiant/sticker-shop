# UI/UX Guidelines

## Overview

This document outlines the design system, UI patterns, and UX guidelines for the Sticker Shop frontend. It ensures consistency across the application and provides a reference for implementing new features.

## Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --primary: #c9a961;        /* Gold - Primary brand color */
  --primary-dark: #8b7245;   /* Dark gold - Hover states */
  --primary-light: #d4b56e;  /* Light gold - Highlights */

  /* Background Colors */
  --bg-primary: #0a1628;     /* Dark blue - Main background */
  --bg-secondary: #0f1c2e;   /* Darker blue - Cards, sections */
  --bg-tertiary: #1c1f26;    /* Darkest - Inputs, elevated elements */

  /* Text Colors */
  --text-primary: #e8dcc4;   /* Light beige - Primary text */
  --text-secondary: #a8a29e; /* Muted beige - Secondary text */
  --text-tertiary: #78716c;  /* Dark beige - Placeholder text */

  /* Border Colors */
  --border-primary: #2c3540; /* Subtle borders */
  --border-secondary: #3c4550; /* Hover borders */

  /* Status Colors */
  --success: #4ade80;        /* Green - Success states */
  --warning: #fbbf24;        /* Yellow - Warning states */
  --error: #f87171;          /* Red - Error states */
  --info: #60a5fa;           /* Blue - Info states */
}
```

TODO: Create color palette documentation with visual swatches

### Typography

```css
:root {
  /* Font Families */
  --font-primary: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing Scale

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;   /* Circular */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.3);
}
```

## Component Patterns

### Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">
  Save Changes
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">
  Cancel
</button>

<!-- Danger Button -->
<button class="btn btn-danger">
  Delete
</button>

<!-- Icon Button -->
<button class="btn btn-icon">
  <span class="icon">🔍</span>
</button>

<!-- Loading State -->
<button class="btn btn-primary" [disabled]="isLoading()">
  {{ isLoading() ? 'Loading...' : 'Submit' }}
</button>
```

```css
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

TODO: Create complete button component library

### Input Fields

```html
<!-- Text Input -->
<div class="form-group">
  <label for="email">Email</label>
  <input
    id="email"
    type="email"
    class="form-input"
    placeholder="you@example.com"
    [value]="email()"
    (input)="email.set($any($event.target).value)"
  />
  @if (emailError()) {
    <span class="form-error">{{ emailError() }}</span>
  }
</div>

<!-- Select -->
<div class="form-group">
  <label for="category">Category</label>
  <select id="category" class="form-select">
    <option value="">Select a category</option>
    <option value="stickers">Stickers</option>
    <option value="prints">Prints</option>
  </select>
</div>

<!-- Textarea -->
<div class="form-group">
  <label for="description">Description</label>
  <textarea
    id="description"
    class="form-textarea"
    rows="4"
  ></textarea>
</div>
```

```css
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.form-error {
  display: block;
  margin-top: 0.5rem;
  font-size: var(--text-sm);
  color: var(--error);
}
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Product Title</h3>
    <span class="card-badge">New</span>
  </div>

  <div class="card-body">
    <p class="card-description">Product description...</p>
    <span class="card-price">$19.99</span>
  </div>

  <div class="card-footer">
    <button class="btn btn-primary">Add to Cart</button>
  </div>
</div>
```

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### Modals

```html
<!-- Modal Overlay -->
@if (isOpen()) {
  <div class="modal-overlay" (click)="close()">
    <div class="modal-content" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h2 class="modal-title">Confirm Delete</h2>
        <button class="modal-close" (click)="close()">×</button>
      </div>

      <div class="modal-body">
        <p>Are you sure you want to delete this item?</p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" (click)="close()">
          Cancel
        </button>
        <button class="btn btn-danger" (click)="confirm()">
          Delete
        </button>
      </div>
    </div>
  </div>
}
```

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Interaction Patterns

### Loading States

```html
<!-- Spinner -->
<div class="spinner"></div>

<!-- Skeleton Loader -->
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-image"></div>

<!-- Loading Overlay -->
@if (isLoading()) {
  <div class="loading-overlay">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
}
```

```css
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(201, 169, 97, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}
```

### Empty States

```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h3 class="empty-title">No items found</h3>
  <p class="empty-description">
    Try adjusting your search or filters
  </p>
  <button class="btn btn-primary">
    Clear Filters
  </button>
</div>
```

### Error States

```html
<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h3 class="error-title">Something went wrong</h3>
  <p class="error-message">{{ errorMessage() }}</p>
  <button class="btn btn-primary" (click)="retry()">
    Try Again
  </button>
</div>
```

### Success Feedback

```html
<!-- Toast Notification -->
@if (showToast()) {
  <div class="toast toast-success">
    <span class="toast-icon">✓</span>
    <span class="toast-message">Item added to cart!</span>
  </div>
}
```

```css
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  animation: slideInRight 0.3s;
  z-index: 1000;
}

.toast-success {
  background: var(--success);
  color: white;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## Accessibility

### Semantic HTML

```html
<!-- Good -->
<nav>
  <ul>
    <li><a href="/products">Products</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Product Title</h1>
    <p>Description...</p>
  </article>
</main>

<!-- Bad -->
<div class="nav">
  <div class="link">Products</div>
</div>
```

### ARIA Labels

```html
<!-- Icon buttons -->
<button aria-label="Close modal" (click)="close()">
  ×
</button>

<!-- Loading states -->
<div role="status" aria-live="polite">
  @if (isLoading()) {
    <span>Loading products...</span>
  }
</div>

<!-- Form validation -->
<input
  type="email"
  aria-describedby="email-error"
  [attr.aria-invalid]="emailError() ? 'true' : null"
/>
@if (emailError()) {
  <span id="email-error" role="alert">
    {{ emailError() }}
  </span>
}
```

### Keyboard Navigation

```typescript
// Trap focus in modal
onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    this.close();
  }

  if (event.key === 'Tab') {
    // Handle tab navigation within modal
  }
}
```

TODO: Implement comprehensive keyboard navigation system

### Focus Management

```css
/* Visible focus indicators */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: var(--primary);
  color: var(--bg-primary);
}

.skip-link:focus {
  top: 0;
}
```

## Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;    /* Small devices */
  --breakpoint-md: 768px;    /* Medium devices */
  --breakpoint-lg: 1024px;   /* Large devices */
  --breakpoint-xl: 1280px;   /* Extra large devices */
}

/* Mobile-first approach */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

### Mobile Patterns

```html
<!-- Mobile menu -->
<nav class="mobile-nav">
  <button class="hamburger" (click)="toggleMenu()">
    ☰
  </button>

  @if (menuOpen()) {
    <div class="mobile-menu">
      <!-- Menu items -->
    </div>
  }
</nav>
```

TODO: Document mobile-specific patterns (swipe gestures, bottom sheets, etc.)

## Animation Guidelines

### Timing Functions

```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animation Durations

- **Fast**: 150ms - Small UI changes (hover, focus)
- **Normal**: 300ms - Most transitions
- **Slow**: 500ms - Complex animations

### Preferred Animations

```css
/* Use transform and opacity for best performance */
.element {
  transition: transform 0.3s, opacity 0.3s;
}

.element:hover {
  transform: translateY(-2px);
}

/* Avoid animating these (causes reflow) */
.bad {
  transition: height 0.3s, width 0.3s, top 0.3s;
}
```

## Best Practices

### ✅ Do's

1. **Use CSS variables for theming**
2. **Follow mobile-first approach**
3. **Provide keyboard navigation**
4. **Add loading and error states**
5. **Use semantic HTML**
6. **Test with screen readers**

### ❌ Don'ts

1. **Don't use only color to convey information**
2. **Don't animate layout properties**
3. **Don't use tiny click targets (<44px)**
4. **Don't forget focus states**
5. **Don't use `div` for everything**

## Design Resources

TODO: Add links to:
- Figma design files
- Icon library
- Image assets
- Brand guidelines

## Related Documentation

- [Components](./components.md) - Component architecture
- [Code Style](../shared/code-style.md) - CSS formatting

---

**Last Updated:** December 2025
