import {
  ICartRepository,
  Cart,
  CartItem,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput
} from '../../domain/cart/cart.types';

/**
 * Demo Cart Store - In-memory cart storage (adapter)
 *
 * Implements ICartRepository port from domain layer
 *
 * SOLID Principles:
 * - Interface Segregation: Implements only ICartRepository methods
 * - Dependency Inversion: Domain depends on interface, this adapts to it
 *
 * Storage:
 * - Map<userId, Cart> for per-user isolation
 * - In-memory only (lost on restart) - OK for demo
 * - Production would use Redis or database
 */
export class DemoCartStore implements ICartRepository {
  private carts = new Map<string, Cart>();

  async getCart(userId: string): Promise<Cart | null> {
    return this.carts.get(userId) || null;
  }

  async addItem(input: AddToCartInput): Promise<Cart> {
    let cart = this.carts.get(input.userId);

    if (!cart) {
      cart = {
        userId: input.userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Check if item already exists (same product + variant)
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === input.productId && item.variantId === input.variantId
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += input.quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: this.generateItemId(),
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        price: input.price,
        title: input.title,
        imageUrl: input.imageUrl,
        addedAt: new Date(),
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date();
    this.carts.set(input.userId, cart);

    return cart;
  }

  async updateItem(input: UpdateCartItemInput): Promise<Cart> {
    const cart = this.carts.get(input.userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(i => i.id === input.itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    item.quantity = input.quantity;
    cart.updatedAt = new Date();

    this.carts.set(input.userId, cart);

    return cart;
  }

  async removeItem(input: RemoveFromCartInput): Promise<Cart> {
    const cart = this.carts.get(input.userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item.id !== input.itemId);
    cart.updatedAt = new Date();

    this.carts.set(input.userId, cart);

    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    this.carts.delete(userId);
  }

  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
