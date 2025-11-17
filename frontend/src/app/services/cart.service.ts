import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, CartTotals, CartItemVariant, StoredCart } from '../models/cart.model';
import { Product, ProductVariant } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'nightreader_cart';
  private readonly STORAGE_VERSION = '1.0';

  // State signals
  cartItems = signal<CartItem[]>([]);
  isDrawerOpen = signal<boolean>(false);

  // Computed totals
  cartTotals = computed<CartTotals>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% estimated
    const total = subtotal + shipping + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, shipping, tax, total, itemCount };
  });

  constructor() {
    this.loadFromStorage();

    // Listen for changes in other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.STORAGE_KEY) {
          this.loadFromStorage();
        }
      });

      // Save to localStorage on every cart change
      effect(() => {
        this.saveToStorage(this.cartItems());
      });
    }
  }

  // Add item to cart
  addToCart(product: Product, variant?: ProductVariant, quantity: number = 1): void {
    const cartItemId = this.generateCartItemId(product.id, variant?.id);
    const existingItem = this.cartItems().find(item => item.id === cartItemId);

    if (existingItem) {
      // Update quantity if item already exists
      this.updateQuantity(cartItemId, existingItem.quantity + quantity);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[0].url,
        collection: product.collection,
        category: product.category,
        price: product.salePrice || product.price,
        originalPrice: product.salePrice ? product.price : undefined,
        quantity,
        variant: variant ? this.mapVariantToCartVariant(variant) : undefined,
        addedAt: new Date()
      };

      this.cartItems.update(items => [...items, newItem]);
    }

    // Open drawer after adding
    this.openDrawer();
  }

  // Remove item from cart
  removeFromCart(itemId: string): void {
    this.cartItems.update(items => items.filter(item => item.id !== itemId));
  }

  // Update item quantity
  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }

  // Clear entire cart
  clearCart(): void {
    this.cartItems.set([]);
  }

  // Drawer controls
  openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.isDrawerOpen.update(isOpen => !isOpen);
  }

  // Get specific cart item
  getCartItem(itemId: string): CartItem | undefined {
    return this.cartItems().find(item => item.id === itemId);
  }

  // Check if product is in cart
  isInCart(productId: string): boolean {
    return this.cartItems().some(item => item.productId === productId);
  }

  // Get quantity of specific product in cart
  getProductQuantity(productId: string): number {
    return this.cartItems()
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  // Private helpers
  private generateCartItemId(productId: string, variantId?: string): string {
    return variantId ? `${productId}_${variantId}` : productId;
  }

  private mapVariantToCartVariant(variant: ProductVariant): CartItemVariant {
    const parts: string[] = [];
    if (variant.size) parts.push(variant.size);
    if (variant.color) parts.push(variant.color);

    return {
      id: variant.id,
      size: variant.size,
      color: variant.color,
      name: parts.join(' / ') || 'Default'
    };
  }

  // LocalStorage persistence
  private saveToStorage(items: CartItem[]): void {
    if (typeof localStorage === 'undefined') return;

    const data: StoredCart = {
      items: items.map(item => ({
        ...item,
        addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : item.addedAt
      })) as any,
      lastUpdated: new Date().toISOString(),
      version: this.STORAGE_VERSION
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed: StoredCart = JSON.parse(data);

        // Validate version
        if (parsed.version === this.STORAGE_VERSION) {
          const items: CartItem[] = parsed.items.map(item => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
          this.cartItems.set(items);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }
}
