import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { CartApi } from './cart.api';
import { Cart, CartTotals, CartItem, AddToCartRequest } from './cart.types';

/**
 * Cart Store - State management using Angular signals
 *
 * Responsibilities:
 * - Manage cart state (items, loading, errors)
 * - Provide computed values (totals)
 * - Coordinate API calls
 * - LocalStorage persistence
 * - Drawer state
 *
 * SOLID Principles:
 * - Single Responsibility: Only cart state management
 * - Dependency Inversion: Depends on CartApi interface
 */
@Injectable({
  providedIn: 'root'
})
export class CartStore {
  private api = inject(CartApi);

  // State signals
  private readonly STORAGE_KEY = 'nightreader_cart';

  items = signal<CartItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  isDrawerOpen = signal<boolean>(false);

  // Computed totals (derived from items)
  totals = computed<CartTotals>(() => {
    const cartItems = this.items();
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount,
    };
  });

  constructor() {
    // Load from localStorage on init
    this.loadFromStorage();

    // Save to localStorage on every change
    effect(() => {
      this.saveToStorage(this.items());
    });

    // Load from backend
    this.loadCart();
  }

  /**
   * Load cart from backend
   */
  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getCart().subscribe({
      next: (response) => {
        this.items.set(response.data.cart.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.error.set('Failed to load cart');
        this.loading.set(false);
      }
    });
  }

  /**
   * Add item to cart
   */
  addItem(request: AddToCartRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.addItem(request).subscribe({
      next: (response) => {
        this.items.set(response.data.cart.items);
        this.loading.set(false);
        this.openDrawer();
      },
      error: (err) => {
        console.error('Failed to add item:', err);
        this.error.set('Failed to add item to cart');
        this.loading.set(false);
      }
    });
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, quantity: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.updateItem(itemId, { quantity }).subscribe({
      next: (response) => {
        this.items.set(response.data.cart.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to update item:', err);
        this.error.set('Failed to update item');
        this.loading.set(false);
      }
    });
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.removeItem(itemId).subscribe({
      next: (response) => {
        this.items.set(response.data.cart.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to remove item:', err);
        this.error.set('Failed to remove item');
        this.loading.set(false);
      }
    });
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.clearCart().subscribe({
      next: (response) => {
        this.items.set([]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to clear cart:', err);
        this.error.set('Failed to clear cart');
        this.loading.set(false);
      }
    });
  }

  /**
   * Drawer controls
   */
  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update(isOpen => !isOpen);
  }

  /**
   * LocalStorage persistence
   */
  private saveToStorage(items: CartItem[]): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const items = JSON.parse(data);
        this.items.set(items);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }
}
