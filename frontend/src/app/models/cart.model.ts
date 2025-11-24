import { ProductCategory, ProductCollection } from './product.model';

export interface CartItem {
  id: string;                    // Unique cart item ID (productId + variantId)
  productId: string;             // Reference to Product
  productTitle: string;
  productImage: string;          // Primary image URL
  collection: ProductCollection | string;
  category: ProductCategory | string;
  price: number;                 // Current price (sale or regular)
  originalPrice?: number;        // If on sale
  quantity: number;
  variant?: CartItemVariant;     // Selected variant details
  addedAt: Date;
}

export interface CartItemVariant {
  id: string;
  size?: string;                 // e.g., "M", "L", "XL"
  color?: string;                // e.g., "Black", "Navy"
  material?: string;             // e.g., "Cotton", "Vinyl"
  name: string;                  // Display name: "M / Black"
}

export interface CartTotals {
  subtotal: number;              // Sum of all items
  shipping: number;              // Shipping cost (free over $50)
  tax: number;                   // Estimated tax (8%)
  total: number;                 // Final total
  itemCount: number;             // Total number of items
  discount?: number;             // Applied discounts
}

export interface CartState {
  items: CartItem[];
  totals: CartTotals;
  isDrawerOpen: boolean;
  lastUpdated: Date;
}

export interface CheckoutData {
  cartItems: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  email: string;
  phone?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ShippingOption {
  id: string;
  name: string;               // "Standard", "Express", "Overnight"
  price: number;
  estimatedDays: string;      // "5-7 business days"
}

// Local storage schema
export interface StoredCart {
  items: CartItem[];
  lastUpdated: string;        // ISO date string
  version: string;            // "1.0" for schema versioning
}
