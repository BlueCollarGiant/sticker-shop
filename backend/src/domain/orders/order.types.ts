/**
 * Order Domain Types
 * Pure business types for the order domain
 */

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentIntentId?: string;
  shippingAddress?: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl: string;
  variantId?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: ShippingAddress;
  paymentIntentId?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export interface OrderListResult {
  data: Order[];
  total: number;
}

/**
 * Order Repository Port (Interface)
 * Defines the contract for order data access
 */
export interface IOrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  delete(id: string): Promise<{ success: boolean; message: string }>;
}
