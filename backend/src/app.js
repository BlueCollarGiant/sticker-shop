const express = require('express');
const cors = require('cors');
const { env, getAllowedOrigins } = require('./config/env.js');
const { createCartRouter } = require('./domain/cart/cart.router.js');
const { createAuthRouter, authService } = require('./domain/auth/auth.router.js');
const { createProductRouter } = require('./domain/products/product.router.js');
const { createOrderRouter } = require('./domain/orders/order.router.js');
const { createCheckoutRouter } = require('./domain/checkout/checkout.router.js');
const { AuthController } = require('./domain/auth/auth.controller.js');
const { authenticate } = require('./middleware/auth.middleware.js');
const { errorHandler } = require('./middleware/error-handler.js');
const { notFound } = require('./middleware/not-found.js');

async function createApp() {
  const app = express();

  app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Night Reader Shop Backend API is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/cart', createCartRouter());
  app.use('/api/auth', createAuthRouter());
  app.use('/api/products', createProductRouter());
  app.use('/api/orders', createOrderRouter());
  app.use('/api/checkout', createCheckoutRouter());

  const authController = new AuthController(authService);
  app.get('/api/auth/me', authenticate, authController.getCurrentUser);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
