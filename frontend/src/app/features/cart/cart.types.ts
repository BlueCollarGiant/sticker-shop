/**
 * Cart feature types
 * Mirror backend types for consistency
 */

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl: string;
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data: {
    cart: Cart;
    totals: CartTotals;
  };
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
