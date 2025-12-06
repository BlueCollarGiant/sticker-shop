const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware.js');
const { requireAdmin } = require('../../middleware/role.middleware.js');
const { ProductController } = require('../products/product.controller.js');
const { ProductService } = require('../products/product.service.js');
const fileProductRepository = require('../../infra/file/file-product.repository.js');
const { OrderController } = require('../orders/order.controller.js');
const { OrderService } = require('../orders/order.service.js');
const fileOrderRepository = require('../../infra/file/file-order.repository.js');
const { getAuthService } = require('../auth/auth.router.js');

let productController;
let orderController;
let authService;

function createAdminRouter() {
  const router = Router();

  if (!productController) {
    const productService = new ProductService(fileProductRepository);
    productController = new ProductController(productService);
  }

  if (!orderController) {
    const orderService = new OrderService(fileOrderRepository);
    orderController = new OrderController(orderService);
  }

  if (!authService) {
    authService = getAuthService();
  }

  router.use(authenticate, requireAdmin);

  router.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      scope: 'admin',
    });
  });

  router.get('/products', productController.getAllProducts);
  router.post('/products', productController.createProduct);
  router.get('/products/:id', productController.getProductById);
  router.put('/products/:id', productController.updateProduct);
  router.delete('/products/:id', productController.deleteProduct);
  router.patch('/products/:id/stock', productController.updateStock);
  router.patch('/products/:id/badge', productController.toggleBadge);

  router.get('/orders', orderController.getAllOrders);
  router.get('/orders/:id', orderController.getOrderById);
  router.patch('/orders/:id/status', orderController.updateOrderStatus);
  router.post('/orders/:id/cancel', orderController.cancelOrder);
  router.delete('/orders/:id', orderController.deleteOrder);

  router.get('/users', async (req, res, next) => {
    try {
      const users = await authService.getAllUsers();
      res.json({
        success: true,
        data: users,
        total: users.length,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/users/:id/orders', async (req, res, next) => {
    try {
      const { id } = req.params;
      const orders = await orderController.orderService.getUserOrders(id);
      res.json({
        success: true,
        data: orders,
        total: orders.length,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createAdminRouter };
