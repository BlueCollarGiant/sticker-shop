/**
 * Cart Business Rules Constants
 *
 * Single source of truth for cart calculation rules
 */

export const CART_CONSTANTS = {
  /**
   * Subtotal threshold for free shipping (USD)
   */
  FREE_SHIPPING_THRESHOLD: 50,

  /**
   * Standard shipping cost when below threshold (USD)
   */
  SHIPPING_COST: 5.99,

  /**
   * Sales tax rate (as decimal)
   */
  TAX_RATE: 0.08,
} as const;

/**
 * Type-safe access to cart constants
 */
export type CartConstants = typeof CART_CONSTANTS;
