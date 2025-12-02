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
