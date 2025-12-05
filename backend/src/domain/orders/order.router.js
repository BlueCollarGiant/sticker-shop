const { Router } = require('express');
const { OrderController } = require('./order.controller');
const { OrderService } = require('./order.service');
const fileOrderRepository = require('../../infra/file/file-order.repository');
const { authenticate } = require('../../middleware/auth.middleware');

let orderService;
let orderController;

function createOrderRouter() {
  const router = Router();

  if (!orderService) {
    orderService = new OrderService(fileOrderRepository);
    orderController = new OrderController(orderService);
  }

  router.use(authenticate);

  router.post('/', orderController.createOrder);
  router.get('/user/me', orderController.getUserOrders);
  router.get('/:id', orderController.getOrderById);
  router.get('/', orderController.getAllOrders);
  router.patch('/:id/status', orderController.updateOrderStatus);
  router.post('/:id/cancel', orderController.cancelOrder);
  router.delete('/:id', orderController.deleteOrder);

  return router;
}

module.exports = { createOrderRouter };
