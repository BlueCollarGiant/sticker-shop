/**
 * Cart domain types
 * Pure business logic types with no infrastructure concerns
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

export interface AddToCartInput {
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  imageUrl: string;
}

export interface UpdateCartItemInput {
  userId: string;
  itemId: string;
  quantity: number;
}

export interface RemoveFromCartInput {
  userId: string;
  itemId: string;
}

/**
 * Cart repository interface (port)
 * Defines what operations we need from storage
 */
export interface ICartRepository {
  getCart(userId: string): Promise<Cart | null>;
  addItem(input: AddToCartInput): Promise<Cart>;
  updateItem(input: UpdateCartItemInput): Promise<Cart>;
  removeItem(input: RemoveFromCartInput): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
}
