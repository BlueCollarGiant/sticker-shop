import { ICartRepository, Cart, CartTotals, AddToCartInput, UpdateCartItemInput, RemoveFromCartInput } from './cart.types';
import { CART_CONSTANTS } from './cart.constants';

/**
 * Cart Service - Business logic for cart operations
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles cart business logic
 * - Dependency Inversion: Depends on ICartRepository interface, not concrete implementation
 */
export class CartService {
  constructor(private readonly cartRepository: ICartRepository) {}

  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.getCart(userId);

    if (!cart) {
      // Return empty cart if none exists
      return {
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return cart;
  }

  /**
   * Add item to cart
   * Business rule: If item already exists, increment quantity
   */
  async addItem(input: AddToCartInput): Promise<Cart> {
    if (input.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (input.price < 0) {
      throw new Error('Price cannot be negative');
    }

    return this.cartRepository.addItem(input);
  }

  /**
   * Update cart item quantity
   * Business rule: If quantity is 0, remove item
   */
  async updateItem(input: UpdateCartItemInput): Promise<Cart> {
    if (input.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (input.quantity === 0) {
      return this.cartRepository.removeItem({
        userId: input.userId,
        itemId: input.itemId,
      });
    }

    return this.cartRepository.updateItem(input);
  }

  /**
   * Remove item from cart
   */
  async removeItem(input: RemoveFromCartInput): Promise<Cart> {
    return this.cartRepository.removeItem(input);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: string): Promise<void> {
    return this.cartRepository.clearCart(userId);
  }

  /**
   * Calculate cart totals
   * Business rules:
   * - Free shipping over FREE_SHIPPING_THRESHOLD
   * - TAX_RATE applied to subtotal
   */
  calculateTotals(cart: Cart): CartTotals {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shipping = subtotal >= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD
      ? 0
      : CART_CONSTANTS.SHIPPING_COST;
    const tax = subtotal * CART_CONSTANTS.TAX_RATE;
    const total = subtotal + shipping + tax;
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount,
    };
  }
}
