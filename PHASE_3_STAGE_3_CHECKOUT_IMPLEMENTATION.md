# Phase 3 - Stage 3: Checkout + Orders Implementation

## Architecture Overview

This stage implements a complete end-to-end order flow:
- **Backend**: Orders domain with seed-file storage
- **Frontend**: OrderStore + Checkout flow integration
- **Admin**: Order management interface
- **Stripe**: Payment scaffolding (not yet integrated)

**Key Principles**:
- Follow existing Auth/Cart/Product domain patterns
- Use signal-based stores on frontend
- Repository pattern with seed-file implementation
- Clean separation: Domain → Service → Controller → Router
- Type alignment between frontend and backend

---

## File Structure

### New Backend Files

```
backend/src/domain/orders/
├── order.types.ts              ⭐ NEW - Order types + IOrderRepository
├── order.service.ts            ⭐ NEW - Business logic
├── order.controller.ts         ⭐ NEW - HTTP handlers
└── order.router.ts             ⭐ NEW - Route definitions

backend/src/infra/demo/
└── demo-order.store.ts         ⭐ NEW - File-based order storage

backend/src/domain/checkout/
├── checkout.controller.ts      ⭐ NEW - Stripe payment intent (scaffold only)
└── checkout.router.ts          ⭐ NEW - Checkout routes
```

### New Frontend Files

```
frontend/src/app/features/orders/
├── order.types.ts              ⭐ NEW - Order types (frontend)
├── order.api.ts                ⭐ NEW - Order API calls
└── order.store.ts              ⭐ NEW - Signal-based order state

frontend/src/app/components/admin/orders/
├── admin-orders.ts             ⭐ NEW - Admin order management
├── admin-orders.html           ⭐ NEW - Admin order UI
└── admin-orders.css            ⭐ NEW - Admin order styles
```

### Modified Files

```
backend/src/app.ts                          ✏️ MODIFY - Add order routes
frontend/src/app/components/checkout/checkout.ts    ✏️ MODIFY - Integrate OrderStore
frontend/src/app/components/account/orders/orders.ts ✏️ MODIFY - Use OrderStore
frontend/src/app/app.routes.ts              ✏️ MODIFY - Add admin orders route
```

---

## Backend Implementation

### 1. Order Types

**File: `backend/src/domain/orders/order.types.ts`** (NEW)

```typescript
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
```

---

### 2. Order Service

**File: `backend/src/domain/orders/order.service.ts`** (NEW)

```typescript
/**
 * Order Service
 * Business logic for order operations
 */

import { IOrderRepository, Order, CreateOrderInput, OrderStatus } from './order.types';

export class OrderService {
  constructor(private repository: IOrderRepository) {}

  /**
   * Create a new order
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Validate order items
    if (!input.items || input.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Validate totals
    if (input.total <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    // Validate user
    if (!input.userId) {
      throw new Error('User ID is required');
    }

    return this.repository.create(input);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.repository.findByUserId(userId);
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(): Promise<Order[]> {
    return this.repository.findAll();
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return this.repository.updateStatus(id, status);
  }

  /**
   * Cancel order (user or admin)
   */
  async cancelOrder(id: string, userId?: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    // If userId provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new Error('You can only cancel your own orders');
    }

    // Only allow cancellation of pending/paid orders
    if (!['pending', 'paid'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    return this.repository.updateStatus(id, OrderStatus.CANCELLED);
  }

  /**
   * Delete order (admin only)
   */
  async deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    return this.repository.delete(id);
  }
}
```

---

### 3. Order Controller

**File: `backend/src/domain/orders/order.controller.ts`** (NEW)

```typescript
/**
 * Order Controller
 * HTTP request handlers for order endpoints
 */

import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { CreateOrderInput, OrderStatus } from './order.types';

export class OrderController {
  constructor(private orderService: OrderService) {
    // Bind methods to preserve 'this' context
    this.createOrder = this.createOrder.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.getUserOrders = this.getUserOrders.bind(this);
    this.getAllOrders = this.getAllOrders.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
  }

  /**
   * POST /api/orders
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User must be logged in to create orders',
        });
        return;
      }

      const input: CreateOrderInput = {
        ...req.body,
        userId, // Use authenticated user ID
      };

      const order = await this.orderService.createOrder(input);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error: any) {
      console.error('[OrderController] Create order error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to create order',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/orders/:id
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const order = await this.orderService.getOrderById(id);

      // Only allow users to view their own orders (unless admin)
      if (userRole !== 'admin' && order.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own orders',
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      console.error('[OrderController] Get order error:', error);
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/orders/user/me
   * Get current user's orders
   */
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const orders = await this.orderService.getUserOrders(userId);

      res.json({
        success: true,
        data: orders,
        total: orders.length,
      });
    } catch (error: any) {
      console.error('[OrderController] Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/orders
   * Get all orders (admin only)
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        });
        return;
      }

      const orders = await this.orderService.getAllOrders();

      res.json({
        success: true,
        data: orders,
        total: orders.length,
      });
    } catch (error: any) {
      console.error('[OrderController] Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /api/orders/:id/status
   * Update order status (admin only)
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status',
          message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
        });
        return;
      }

      const order = await this.orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order,
        message: 'Order status updated',
      });
    } catch (error: any) {
      console.error('[OrderController] Update status error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to update order status',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/orders/:id/cancel
   * Cancel order
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      // Admin can cancel any order, users can only cancel their own
      const order = await this.orderService.cancelOrder(
        id,
        userRole === 'admin' ? undefined : userId
      );

      res.json({
        success: true,
        data: order,
        message: 'Order cancelled',
      });
    } catch (error: any) {
      console.error('[OrderController] Cancel order error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to cancel order',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/orders/:id
   * Delete order (admin only)
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        });
        return;
      }

      const { id } = req.params;
      const result = await this.orderService.deleteOrder(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[OrderController] Delete order error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to delete order',
        message: error.message,
      });
    }
  }
}
```

---

### 4. Order Router

**File: `backend/src/domain/orders/order.router.ts`** (NEW)

```typescript
/**
 * Order Router
 * Route definitions with dependency injection
 */

import { Router } from 'express';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DemoOrderStore } from '../../infra/demo/demo-order.store';
import { authenticate } from '../../middleware/auth.middleware';

// Singleton instances
let orderService: OrderService;
let orderController: OrderController;

export function createOrderRouter(): Router {
  const router = Router();

  // Initialize dependencies (singleton pattern)
  if (!orderService) {
    const orderStore = new DemoOrderStore();
    orderService = new OrderService(orderStore);
    orderController = new OrderController(orderService);
  }

  // All routes require authentication
  router.use(authenticate);

  // Order routes
  router.post('/', orderController.createOrder);
  router.get('/user/me', orderController.getUserOrders);
  router.get('/:id', orderController.getOrderById);
  router.get('/', orderController.getAllOrders); // Admin only (checked in controller)
  router.patch('/:id/status', orderController.updateOrderStatus); // Admin only
  router.post('/:id/cancel', orderController.cancelOrder);
  router.delete('/:id', orderController.deleteOrder); // Admin only

  return router;
}
```

---

### 5. Demo Order Store

**File: `backend/src/infra/demo/demo-order.store.ts`** (NEW)

```typescript
/**
 * Demo Order Store
 * File-based order repository for demo/development mode
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IOrderRepository,
  Order,
  CreateOrderInput,
  OrderStatus,
} from '../../domain/orders/order.types';

export class DemoOrderStore implements IOrderRepository {
  private ordersFile = path.join(__dirname, '../../../data/demo-orders.json');
  private orders: Order[] = [];
  private orderCounter = 1;

  constructor() {
    this.loadOrders();
  }

  /**
   * Load orders from file
   */
  private async loadOrders(): Promise<void> {
    try {
      const data = await fs.readFile(this.ordersFile, 'utf-8');
      this.orders = JSON.parse(data).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
      }));

      // Set counter to highest order number
      if (this.orders.length > 0) {
        const maxId = Math.max(
          ...this.orders.map((o) => parseInt(o.id.replace('order-', '')))
        );
        this.orderCounter = maxId + 1;
      }
    } catch (error) {
      // File doesn't exist, start with empty array
      this.orders = [];
      await this.saveOrders();
    }
  }

  /**
   * Save orders to file
   */
  private async saveOrders(): Promise<void> {
    try {
      await fs.writeFile(
        this.ordersFile,
        JSON.stringify(this.orders, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('[DemoOrderStore] Failed to save orders:', error);
    }
  }

  /**
   * Generate order number (e.g., NR20250112-001)
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(this.orderCounter).padStart(3, '0');
    return `NR${year}${month}${day}-${sequence}`;
  }

  /**
   * Create a new order
   */
  async create(input: CreateOrderInput): Promise<Order> {
    const order: Order = {
      id: `order-${this.orderCounter++}`,
      orderNumber: this.generateOrderNumber(),
      userId: input.userId,
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      shipping: input.shipping,
      total: input.total,
      status: input.paymentIntentId ? OrderStatus.PAID : OrderStatus.PENDING,
      paymentIntentId: input.paymentIntentId,
      shippingAddress: input.shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.unshift(order); // Add to beginning
    await this.saveOrders();

    return order;
  }

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) || null;
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(userId: string): Promise<Order[]> {
    return this.orders
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Find all orders
   */
  async findAll(): Promise<Order[]> {
    return [...this.orders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const orderIndex = this.orders.findIndex((order) => order.id === id);
    if (orderIndex === -1) {
      throw new Error(`Order with id ${id} not found`);
    }

    this.orders[orderIndex].status = status;
    this.orders[orderIndex].updatedAt = new Date();

    await this.saveOrders();

    return this.orders[orderIndex];
  }

  /**
   * Delete order
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter((order) => order.id !== id);

    if (this.orders.length === initialLength) {
      throw new Error(`Order with id ${id} not found`);
    }

    await this.saveOrders();

    return {
      success: true,
      message: `Order ${id} deleted successfully`,
    };
  }

  /**
   * Check if orders file is empty (for seeding)
   */
  async isEmpty(): Promise<boolean> {
    return this.orders.length === 0;
  }
}
```

---

### 6. Checkout Controller (Stripe Scaffold)

**File: `backend/src/domain/checkout/checkout.controller.ts`** (NEW)

```typescript
/**
 * Checkout Controller
 * Handles payment intent creation (Stripe scaffold)
 *
 * NOTE: This is a scaffold for future Stripe integration.
 * Payment processing is not yet active.
 */

import { Request, Response } from 'express';

export class CheckoutController {
  constructor() {
    this.createPaymentIntent = this.createPaymentIntent.bind(this);
  }

  /**
   * POST /api/checkout/create-payment-intent
   * Create Stripe payment intent (scaffold only)
   */
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency = 'usd' } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount',
          message: 'Amount must be greater than zero',
        });
        return;
      }

      // TODO: Integrate Stripe SDK
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(amount * 100), // Convert to cents
      //   currency,
      //   automatic_payment_methods: { enabled: true },
      // });

      // For now, return mock response
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method',
      };

      res.json({
        success: true,
        data: {
          clientSecret: mockPaymentIntent.client_secret,
          paymentIntentId: mockPaymentIntent.id,
        },
        message: 'Payment intent created (mock - Stripe not yet integrated)',
      });
    } catch (error: any) {
      console.error('[CheckoutController] Create payment intent error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment intent',
        message: error.message,
      });
    }
  }
}
```

---

### 7. Checkout Router

**File: `backend/src/domain/checkout/checkout.router.ts`** (NEW)

```typescript
/**
 * Checkout Router
 * Payment-related routes
 */

import { Router } from 'express';
import { CheckoutController } from './checkout.controller';
import { authenticate } from '../../middleware/auth.middleware';

export function createCheckoutRouter(): Router {
  const router = Router();

  const checkoutController = new CheckoutController();

  // All routes require authentication
  router.use(authenticate);

  // Checkout routes
  router.post('/create-payment-intent', checkoutController.createPaymentIntent);

  return router;
}
```

---

### 8. Update App.ts

**File: `backend/src/app.ts`** (MODIFY)

```typescript
// Add imports at top
import { createOrderRouter } from './domain/orders/order.router';
import { createCheckoutRouter } from './domain/checkout/checkout.router';

// Inside createApp() function, add routes after existing routes:
export async function createApp(): Promise<Express> {
  // ... existing code ...

  // Routes
  app.use('/api/cart', createCartRouter());
  app.use('/api/auth', createAuthRouter());
  app.use('/api/products', createProductRouter());
  app.use('/api/orders', createOrderRouter());        // ⭐ ADD THIS
  app.use('/api/checkout', createCheckoutRouter());   // ⭐ ADD THIS

  // ... rest of existing code ...
}
```

---

### 9. Create Demo Orders Data File

**File: `backend/data/demo-orders.json`** (NEW)

```json
[]
```

---

## Frontend Implementation

### 1. Order Types

**File: `frontend/src/app/features/orders/order.types.ts`** (NEW)

```typescript
/**
 * Order Types (Frontend)
 * Aligned with backend order types
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
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: ShippingAddress;
  paymentIntentId?: string;
}
```

---

### 2. Order API

**File: `frontend/src/app/features/orders/order.api.ts`** (NEW)

```typescript
/**
 * Order API
 * Thin HTTP client layer for order operations
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, CreateOrderInput, OrderStatus } from './order.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderApi {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/orders';
  private readonly checkoutUrl = 'http://localhost:3000/api/checkout';

  /**
   * Create a new order
   */
  createOrder(input: CreateOrderInput): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(this.apiUrl, input)
      .pipe(map((response) => response.data));
  }

  /**
   * Get current user's orders
   */
  getUserOrders(): Observable<Order[]> {
    return this.http
      .get<ApiResponse<Order[]>>(`${this.apiUrl}/user/me`)
      .pipe(map((response) => response.data));
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Observable<Order> {
    return this.http
      .get<ApiResponse<Order>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Get all orders (admin only)
   */
  getAllOrders(): Observable<Order[]> {
    return this.http
      .get<ApiResponse<Order[]>>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  /**
   * Update order status (admin only)
   */
  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(map((response) => response.data));
  }

  /**
   * Cancel order
   */
  cancelOrder(id: string): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(map((response) => response.data));
  }

  /**
   * Create payment intent (Stripe scaffold)
   */
  createPaymentIntent(
    amount: number,
    currency: string = 'usd'
  ): Observable<{ clientSecret: string; paymentIntentId: string }> {
    return this.http
      .post<ApiResponse<{ clientSecret: string; paymentIntentId: string }>>(
        `${this.checkoutUrl}/create-payment-intent`,
        { amount, currency }
      )
      .pipe(map((response) => response.data));
  }
}
```

---

### 3. Order Store

**File: `frontend/src/app/features/orders/order.store.ts`** (NEW)

```typescript
/**
 * Order Store
 * Signals-based state management for orders
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrderApi } from './order.api';
import { Order, CreateOrderInput, OrderStatus } from './order.types';

@Injectable({
  providedIn: 'root',
})
export class OrderStore {
  private orderApi = inject(OrderApi);
  private router = inject(Router);

  // State signals
  private _orders = signal<Order[]>([]);
  private _selectedOrder = signal<Order | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _submittingOrder = signal<boolean>(false);

  // Public readonly signals
  readonly orders = this._orders.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly errorMessage = this._error.asReadonly();
  readonly isSubmittingOrder = this._submittingOrder.asReadonly();

  // Computed signals
  readonly orderCount = computed(() => this._orders().length);
  readonly hasOrders = computed(() => this._orders().length > 0);

  // Computed: Recent orders (last 5)
  readonly recentOrders = computed(() =>
    this._orders().slice(0, 5)
  );

  // Computed: Orders by status
  readonly pendingOrders = computed(() =>
    this._orders().filter((o) => o.status === OrderStatus.PENDING)
  );

  readonly processingOrders = computed(() =>
    this._orders().filter((o) => o.status === OrderStatus.PROCESSING)
  );

  readonly completedOrders = computed(() =>
    this._orders().filter(
      (o) =>
        o.status === OrderStatus.DELIVERED || o.status === OrderStatus.SHIPPED
    )
  );

  /**
   * Load user's orders
   */
  async loadUserOrders(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const orders = await this.orderApi.getUserOrders().toPromise();
      if (orders) {
        // Convert date strings to Date objects
        const ordersWithDates = orders.map((o) => ({
          ...o,
          createdAt:
            o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt),
          updatedAt:
            o.updatedAt instanceof Date ? o.updatedAt : new Date(o.updatedAt),
        }));
        this._orders.set(ordersWithDates);
      }
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Load all orders (admin only)
   */
  async loadAllOrders(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const orders = await this.orderApi.getAllOrders().toPromise();
      if (orders) {
        const ordersWithDates = orders.map((o) => ({
          ...o,
          createdAt:
            o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt),
          updatedAt:
            o.updatedAt instanceof Date ? o.updatedAt : new Date(o.updatedAt),
        }));
        this._orders.set(ordersWithDates);
      }
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Load order by ID
   */
  async loadOrderById(id: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const order = await this.orderApi.getOrderById(id).toPromise();
      if (order) {
        const orderWithDates = {
          ...order,
          createdAt:
            order.createdAt instanceof Date
              ? order.createdAt
              : new Date(order.createdAt),
          updatedAt:
            order.updatedAt instanceof Date
              ? order.updatedAt
              : new Date(order.updatedAt),
        };
        this._selectedOrder.set(orderWithDates);
      }
    } catch (err: any) {
      this._error.set(err.message || 'Failed to load order');
      console.error('Failed to load order:', err);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Submit order (from cart)
   */
  async submitOrder(
    input: CreateOrderInput
  ): Promise<{ success: boolean; orderId?: string }> {
    this._submittingOrder.set(true);
    this._error.set(null);

    try {
      const order = await this.orderApi.createOrder(input).toPromise();
      if (order) {
        // Add to local orders array
        const orderWithDates = {
          ...order,
          createdAt:
            order.createdAt instanceof Date
              ? order.createdAt
              : new Date(order.createdAt),
          updatedAt:
            order.updatedAt instanceof Date
              ? order.updatedAt
              : new Date(order.updatedAt),
        };
        this._orders.update((orders) => [orderWithDates, ...orders]);

        return { success: true, orderId: order.id };
      }
      return { success: false };
    } catch (err: any) {
      this._error.set(err.message || 'Failed to submit order');
      console.error('Failed to submit order:', err);
      return { success: false };
    } finally {
      this._submittingOrder.set(false);
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
    try {
      const updatedOrder = await this.orderApi
        .updateOrderStatus(id, status)
        .toPromise();

      if (updatedOrder) {
        // Update in local state
        this._orders.update((orders) =>
          orders.map((o) => (o.id === id ? updatedOrder : o))
        );

        // Update selected order if it's the one being modified
        if (this._selectedOrder()?.id === id) {
          this._selectedOrder.set(updatedOrder);
        }

        return true;
      }
      return false;
    } catch (err: any) {
      this._error.set(err.message || 'Failed to update order status');
      console.error('Failed to update order status:', err);
      return false;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string): Promise<boolean> {
    try {
      const cancelledOrder = await this.orderApi.cancelOrder(id).toPromise();

      if (cancelledOrder) {
        // Update in local state
        this._orders.update((orders) =>
          orders.map((o) => (o.id === id ? cancelledOrder : o))
        );

        return true;
      }
      return false;
    } catch (err: any) {
      this._error.set(err.message || 'Failed to cancel order');
      console.error('Failed to cancel order:', err);
      return false;
    }
  }

  /**
   * Clear selected order
   */
  clearSelectedOrder(): void {
    this._selectedOrder.set(null);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }
}
```

---

### 4. Update Checkout Component

**File: `frontend/src/app/components/checkout/checkout.ts`** (REPLACE ENTIRE FILE)

```typescript
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../features/cart/cart.store';
import { AuthStore } from '../../features/auth/auth.store';
import { OrderStore } from '../../features/orders/order.store';
import { CreateOrderInput, ShippingAddress } from '../../features/orders/order.types';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  cartStore = inject(CartStore);
  auth = inject(AuthStore);
  orderStore = inject(OrderStore);
  router = inject(Router);

  // State
  processing = signal(false);
  currentStep = signal<'shipping' | 'payment' | 'review'>('shipping');

  // Shipping form
  shippingAddress = signal<ShippingAddress>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  // Validation errors
  shippingErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    // Redirect if cart is empty
    if (this.cartStore.items().length === 0) {
      this.router.navigate(['/products']);
    }

    // Redirect if not logged in
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
    }
  }

  /**
   * Validate shipping form
   */
  validateShipping(): boolean {
    const errors: Record<string, string> = {};
    const address = this.shippingAddress();

    if (!address.firstName.trim()) {
      errors['firstName'] = 'First name is required';
    }
    if (!address.lastName.trim()) {
      errors['lastName'] = 'Last name is required';
    }
    if (!address.addressLine1.trim()) {
      errors['addressLine1'] = 'Address is required';
    }
    if (!address.city.trim()) {
      errors['city'] = 'City is required';
    }
    if (!address.state.trim()) {
      errors['state'] = 'State is required';
    }
    if (!address.zipCode.trim()) {
      errors['zipCode'] = 'ZIP code is required';
    }

    this.shippingErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    if (this.currentStep() === 'shipping') {
      if (this.validateShipping()) {
        this.currentStep.set('review');
      }
    }
  }

  /**
   * Go to previous step
   */
  prevStep(): void {
    if (this.currentStep() === 'review') {
      this.currentStep.set('shipping');
    }
  }

  /**
   * Complete order
   */
  async completeOrder(): Promise<void> {
    if (!this.validateShipping()) {
      this.currentStep.set('shipping');
      return;
    }

    this.processing.set(true);

    const currentUser = this.auth.user();
    if (!currentUser) {
      console.error('No user logged in');
      this.processing.set(false);
      this.router.navigate(['/login']);
      return;
    }

    // Get cart items and totals
    const cartItems = this.cartStore.items();
    const totals = this.cartStore.totals();

    // Create order input
    const orderInput: CreateOrderInput = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
        variantId: item.variantId,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total,
      shippingAddress: this.shippingAddress(),
    };

    // Submit order
    const result = await this.orderStore.submitOrder(orderInput);

    this.processing.set(false);

    if (result.success) {
      // Clear cart
      this.cartStore.clearCart();

      // Navigate to orders page
      this.router.navigate(['/dashboard/orders']);
    } else {
      alert('Failed to create order. Please try again.');
    }
  }

  get cartItems() {
    return this.cartStore.items();
  }

  get cartTotals() {
    return this.cartStore.totals();
  }

  get orderError() {
    return this.orderStore.errorMessage();
  }

  get isSubmitting() {
    return this.orderStore.isSubmittingOrder();
  }
}
```

---

### 5. Update Orders Component (Account Orders)

**File: `frontend/src/app/components/account/orders/orders.ts`** (REPLACE ENTIRE FILE)

```typescript
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderStore } from '../../../features/orders/order.store';
import { Order, OrderStatus } from '../../../features/orders/order.types';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orderStore = inject(OrderStore);

  // Expose store signals
  orders = this.orderStore.orders;
  isLoading = this.orderStore.isLoading;
  errorMessage = this.orderStore.errorMessage;

  // Local state
  expandedOrderId = signal<string | null>(null);

  // Enum for template
  OrderStatus = OrderStatus;

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    await this.orderStore.loadUserOrders();
  }

  toggleOrderDetails(orderId: string): void {
    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(orderId);
    }
  }

  isOrderExpanded(orderId: string): boolean {
    return this.expandedOrderId() === orderId;
  }

  async cancelOrder(orderId: string): Promise<void> {
    if (confirm('Are you sure you want to cancel this order?')) {
      const success = await this.orderStore.cancelOrder(orderId);
      if (success) {
        // Reload orders to reflect updated status
        await this.loadOrders();
      }
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.PAID:
        return 'status-paid';
      case OrderStatus.PROCESSING:
        return 'status-processing';
      case OrderStatus.SHIPPED:
        return 'status-shipped';
      case OrderStatus.DELIVERED:
        return 'status-delivered';
      case OrderStatus.CANCELLED:
        return 'status-cancelled';
      case OrderStatus.FAILED:
        return 'status-failed';
      default:
        return 'status-unknown';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  canCancelOrder(order: Order): boolean {
    return (
      order.status === OrderStatus.PENDING ||
      order.status === OrderStatus.PAID
    );
  }
}
```

---

### 6. Admin Orders Component

**File: `frontend/src/app/components/admin/orders/admin-orders.ts`** (NEW)

```typescript
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderStore } from '../../../features/orders/order.store';
import { Order, OrderStatus } from '../../../features/orders/order.types';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  orderStore = inject(OrderStore);

  // State
  searchQuery = signal('');
  statusFilter = signal<OrderStatus | 'all'>('all');
  selectedOrderId = signal<string | null>(null);

  // Expose store signals
  allOrders = this.orderStore.orders;
  isLoading = this.orderStore.isLoading;
  errorMessage = this.orderStore.errorMessage;

  // Enum for template
  OrderStatus = OrderStatus;
  statusOptions = Object.values(OrderStatus);

  // Computed: Filtered orders
  filteredOrders = computed(() => {
    let orders = this.allOrders();
    const query = this.searchQuery().toLowerCase();
    const statusFilter = this.statusFilter();

    // Filter by search query (order number, user ID, items)
    if (query) {
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.userId.toLowerCase().includes(query) ||
          o.items.some((item) => item.title.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      orders = orders.filter((o) => o.status === statusFilter);
    }

    return orders;
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    await this.orderStore.loadAllOrders();
  }

  toggleOrderDetails(orderId: string): void {
    if (this.selectedOrderId() === orderId) {
      this.selectedOrderId.set(null);
    } else {
      this.selectedOrderId.set(orderId);
    }
  }

  isOrderExpanded(orderId: string): boolean {
    return this.selectedOrderId() === orderId;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const success = await this.orderStore.updateOrderStatus(orderId, newStatus);
    if (success) {
      // Optionally reload orders
      // await this.loadOrders();
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.PAID:
        return 'status-paid';
      case OrderStatus.PROCESSING:
        return 'status-processing';
      case OrderStatus.SHIPPED:
        return 'status-shipped';
      case OrderStatus.DELIVERED:
        return 'status-delivered';
      case OrderStatus.CANCELLED:
        return 'status-cancelled';
      case OrderStatus.FAILED:
        return 'status-failed';
      default:
        return 'status-unknown';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
```

**File: `frontend/src/app/components/admin/orders/admin-orders.html`** (NEW)

```html
<div class="admin-orders">
  <header class="admin-header">
    <h1 class="admin-title">Order Management</h1>
    <p class="admin-subtitle">
      {{ filteredOrders().length }} order{{ filteredOrders().length !== 1 ? 's' : '' }}
    </p>
  </header>

  <!-- Search and Filters -->
  <div class="filters-section">
    <div class="search-box">
      <input
        type="text"
        class="search-input"
        placeholder="Search by order number, user, or item..."
        [(ngModel)]="searchQuery"
      />
      <span class="search-icon">🔍</span>
    </div>

    <div class="filter-group">
      <label for="status-filter">Status:</label>
      <select
        id="status-filter"
        class="status-filter"
        [(ngModel)]="statusFilter"
      >
        <option value="all">All Statuses</option>
        @for (status of statusOptions; track status) {
          <option [value]="status">{{ status }}</option>
        }
      </select>
    </div>
  </div>

  <!-- Loading State -->
  @if (isLoading()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading orders...</p>
    </div>
  }

  <!-- Error State -->
  @else if (errorMessage()) {
    <div class="error-state">
      <p class="error-message">{{ errorMessage() }}</p>
      <button class="btn-retry" (click)="loadOrders()">Retry</button>
    </div>
  }

  <!-- Empty State -->
  @else if (filteredOrders().length === 0) {
    <div class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">No orders found</p>
    </div>
  }

  <!-- Orders List -->
  @else {
    <div class="orders-list">
      @for (order of filteredOrders(); track order.id) {
        <div class="order-card" [class.expanded]="isOrderExpanded(order.id)">
          <div class="order-summary" (click)="toggleOrderDetails(order.id)">
            <div class="order-number">
              <strong>#{{ order.orderNumber }}</strong>
            </div>
            <div class="order-user">
              <span class="label">User:</span>
              <span class="value">{{ order.userId }}</span>
            </div>
            <div class="order-date">
              {{ formatDate(order.createdAt) }}
            </div>
            <div class="order-status">
              <span class="status-badge" [class]="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </div>
            <div class="order-total">
              ${{ order.total.toFixed(2) }}
            </div>
            <div class="expand-icon">
              {{ isOrderExpanded(order.id) ? '▼' : '▶' }}
            </div>
          </div>

          @if (isOrderExpanded(order.id)) {
            <div class="order-details">
              <!-- Order Items -->
              <div class="details-section">
                <h3 class="section-title">Items ({{ order.items.length }})</h3>
                <div class="items-list">
                  @for (item of order.items; track item.productId) {
                    <div class="order-item">
                      <img [src]="item.imageUrl" [alt]="item.title" class="item-image" />
                      <div class="item-info">
                        <p class="item-title">{{ item.title }}</p>
                        <p class="item-meta">
                          Qty: {{ item.quantity }} × ${{ item.price.toFixed(2) }}
                        </p>
                      </div>
                      <div class="item-total">
                        ${{ (item.quantity * item.price).toFixed(2) }}
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Totals -->
              <div class="details-section">
                <h3 class="section-title">Order Totals</h3>
                <div class="totals-grid">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${{ order.subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="total-row">
                    <span>Tax:</span>
                    <span>${{ order.tax.toFixed(2) }}</span>
                  </div>
                  <div class="total-row">
                    <span>Shipping:</span>
                    <span>${{ order.shipping.toFixed(2) }}</span>
                  </div>
                  <div class="total-row total-final">
                    <span><strong>Total:</strong></span>
                    <span><strong>${{ order.total.toFixed(2) }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Shipping Address -->
              @if (order.shippingAddress) {
                <div class="details-section">
                  <h3 class="section-title">Shipping Address</h3>
                  <div class="address-block">
                    <p>{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</p>
                    <p>{{ order.shippingAddress.addressLine1 }}</p>
                    @if (order.shippingAddress.addressLine2) {
                      <p>{{ order.shippingAddress.addressLine2 }}</p>
                    }
                    <p>
                      {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}
                      {{ order.shippingAddress.zipCode }}
                    </p>
                    <p>{{ order.shippingAddress.country }}</p>
                  </div>
                </div>
              }

              <!-- Status Update -->
              <div class="details-section">
                <h3 class="section-title">Update Status</h3>
                <div class="status-update">
                  <select
                    class="status-select"
                    [value]="order.status"
                    (change)="updateOrderStatus(order.id, $any($event.target).value)"
                  >
                    @for (status of statusOptions; track status) {
                      <option [value]="status">{{ status }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  }
</div>
```

**File: `frontend/src/app/components/admin/orders/admin-orders.css`** (NEW)

```css
.admin-orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.admin-subtitle {
  color: #666;
  font-size: 1rem;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-filter {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #333;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card.expanded {
  border-color: #333;
}

.order-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.order-summary:hover {
  background: #f9f9f9;
}

.order-number {
  min-width: 150px;
}

.order-user {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.order-user .label {
  font-weight: 600;
  color: #666;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #cce5ff;
  color: #004085;
}

.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.order-total {
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 100px;
  text-align: right;
}

.expand-icon {
  font-size: 1.2rem;
  color: #666;
}

.order-details {
  border-top: 2px solid #e0e0e0;
  padding: 2rem;
  background: #f9f9f9;
}

.details-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.item-meta {
  color: #666;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 700;
}

.totals-grid {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.total-row:last-child {
  border-bottom: none;
}

.total-final {
  font-size: 1.2rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #333;
}

.address-block {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.address-block p {
  margin-bottom: 0.25rem;
}

.status-update {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.status-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-retry:hover {
  background: #555;
}
```

---

### 7. Update Admin Panel to Include Orders Tab

**File: `frontend/src/app/components/admin/admin-panel/admin-panel.html`** (MODIFY)

Add Orders tab to navigation:

```html
<nav class="admin-tabs">
  <button
    (click)="activeTab.set('general')"
    [class.active]="activeTab() === 'general'"
  >
    General
  </button>
  <button
    (click)="activeTab.set('products')"
    [class.active]="activeTab() === 'products'"
  >
    Products
  </button>
  <button
    (click)="activeTab.set('orders')"
    [class.active]="activeTab() === 'orders'"
  >
    Orders
  </button>
  <button
    (click)="activeTab.set('sales')"
    [class.active]="activeTab() === 'sales'"
  >
    Sales
  </button>
  <button
    (click)="activeTab.set('users')"
    [class.active]="activeTab() === 'users'"
  >
    Users
  </button>
</nav>

<!-- Add Orders Tab Content -->
@if (activeTab() === 'orders') {
  <app-admin-orders />
}
```

**File: `frontend/src/app/components/admin/admin-panel/admin-panel.ts`** (MODIFY)

Update imports:

```typescript
import { AdminOrders } from '../orders/admin-orders';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, FormsModule, RouterLink, AdminOrders], // Add AdminOrders
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  // ... existing code ...
}
```

---

## API Contract Summary

### Order Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | User | Create new order |
| GET | `/api/orders/user/me` | User | Get current user's orders |
| GET | `/api/orders/:id` | User/Admin | Get order by ID |
| GET | `/api/orders` | Admin | Get all orders |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/orders/:id/cancel` | User/Admin | Cancel order |
| DELETE | `/api/orders/:id` | Admin | Delete order |

### Checkout Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/checkout/create-payment-intent` | User | Create Stripe payment intent (scaffold) |

---

## Migration Steps

### Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Create data file for orders
touch data/demo-orders.json
echo "[]" > data/demo-orders.json

# 3. Verify TypeScript compiles
npm run build

# 4. Start backend server
npm run dev
```

Expected console output:
```
✅ Night Reader Shop - Backend running on port 3000
📍 Mode: DEMO
```

### Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Verify TypeScript compiles
npm run build

# 3. Start frontend server
npm start
```

---

## Verification Checklist

### Backend Verification

- [ ] Server starts without errors
- [ ] `/api/orders` endpoint exists (test with Postman)
- [ ] POST `/api/orders` creates order and saves to `demo-orders.json`
- [ ] GET `/api/orders/user/me` returns user's orders (requires auth token)
- [ ] Admin can GET `/api/orders` (all orders)
- [ ] Order status update works (PATCH `/api/orders/:id/status`)

### Frontend Verification

- [ ] Checkout page loads with shipping form
- [ ] Shipping form validation works
- [ ] Completing order creates order via API
- [ ] Order appears in `/dashboard/orders`
- [ ] Cart clears after order completion
- [ ] Admin can view all orders in admin panel
- [ ] Admin can update order status
- [ ] Order cancellation works

### Integration Testing

**Test Flow 1: User Creates Order**
1. Log in as user (demo: `demo@nightreader.com` / `demo123`)
2. Add products to cart
3. Navigate to `/checkout`
4. Fill shipping form
5. Click "Complete Order"
6. Verify redirect to `/dashboard/orders`
7. Verify order appears in list
8. Verify cart is empty

**Test Flow 2: Admin Manages Orders**
1. Log in as admin (demo: `admin@nightreader.com` / `admin123`)
2. Navigate to Admin Panel → Orders tab
3. Verify all orders appear
4. Click order to expand details
5. Change order status
6. Verify status updates

---

## Cleanup Steps

### Remove Old Order Logic (If Any)

Check for old localStorage-based order code in:
- `frontend/src/app/components/checkout/checkout.ts`
- `frontend/src/app/components/account/orders/orders.ts`

Delete any:
```typescript
// OLD CODE - DELETE
localStorage.setItem('user_orders_${userId}', ...)
const savedOrders = localStorage.getItem('user_orders_${userId}')
```

Replace with OrderStore calls.

---

## Summary

### What Was Implemented

✅ **Backend Orders Domain**
- Complete CRUD operations for orders
- Order repository pattern with seed-file storage
- Order service with business logic validation
- Order controller with proper authentication/authorization
- Order router with dependency injection

✅ **Backend Checkout Scaffold**
- Payment intent endpoint (mock Stripe response)
- Ready for Stripe SDK integration

✅ **Frontend OrderStore**
- Signal-based order state management
- User order history loading
- Admin order management
- Order submission from cart
- Order cancellation

✅ **Frontend Checkout Flow**
- Multi-step checkout (shipping → review)
- Shipping address form with validation
- Integration with OrderStore
- Cart clearing after order completion

✅ **Frontend Admin Orders**
- Order management interface
- Search and filter orders
- Status updates
- Order detail view with items, totals, and shipping

### Files Created

**Backend** (9 files):
- `domain/orders/order.types.ts`
- `domain/orders/order.service.ts`
- `domain/orders/order.controller.ts`
- `domain/orders/order.router.ts`
- `infra/demo/demo-order.store.ts`
- `domain/checkout/checkout.controller.ts`
- `domain/checkout/checkout.router.ts`
- `data/demo-orders.json`
- Modified: `app.ts`

**Frontend** (6 files + modifications):
- `features/orders/order.types.ts`
- `features/orders/order.api.ts`
- `features/orders/order.store.ts`
- `components/admin/orders/admin-orders.ts`
- `components/admin/orders/admin-orders.html`
- `components/admin/orders/admin-orders.css`
- Modified: `components/checkout/checkout.ts`
- Modified: `components/account/orders/orders.ts`
- Modified: `components/admin/admin-panel/admin-panel.html`
- Modified: `components/admin/admin-panel/admin-panel.ts`

### Architecture Consistency

✅ Follows Auth/Cart/Product domain patterns
✅ Repository pattern with IOrderRepository
✅ Signal-based stores on frontend
✅ Type alignment between backend and frontend
✅ Proper authentication/authorization checks
✅ Clean separation of concerns

---

## Next Phase Recommendations

### Phase 3 - Stage 4: Stripe Integration (Full)

1. **Install Stripe SDK**
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Replace Mock Payment Intent**
   - Update `checkout.controller.ts` to use real Stripe API
   - Add `STRIPE_SECRET_KEY` to `.env`
   - Implement webhook handler for payment confirmation

3. **Frontend Stripe Elements**
   - Add Stripe Elements to checkout page
   - Implement 3D Secure flow
   - Handle payment errors

4. **Order Status Automation**
   - Auto-update order status when payment succeeds
   - Send order confirmation emails
   - Update inventory on order completion

### Phase 3 - Stage 5: Production PostgreSQL Migration

1. **Create PostgreSQL Order Repository**
   - `backend/src/infra/postgres/postgres-order.repository.ts`
   - Implement `IOrderRepository` with Prisma

2. **Update Prisma Schema**
   - Add Order and OrderItem models
   - Run migration

3. **Swap Repository in DI**
   - Update `order.router.ts` to use `PostgresOrderRepository`

4. **Data Migration**
   - Script to import `demo-orders.json` → PostgreSQL

---

**STATUS**: ✅ Phase 3 Stage 3 Complete - Checkout + Orders Implementation Ready for Testing
