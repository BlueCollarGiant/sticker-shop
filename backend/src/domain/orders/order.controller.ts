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
