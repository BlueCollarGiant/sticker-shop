import express, { Express } from 'express';
import cors from 'cors';
import { env, getAllowedOrigins } from './config/env';
import { createCartRouter } from './domain/cart/cart.router';
import { createAuthRouter, authService } from './domain/auth/auth.router';
import { createProductRouter } from './domain/products/product.router';
import { createOrderRouter } from './domain/orders/order.router';
import { createCheckoutRouter } from './domain/checkout/checkout.router';
import { AuthController } from './domain/auth/auth.controller';
import { authenticate } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';

/**
 * Create and configure Express application
 */
export async function createApp(): Promise<Express> {
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Night Reader Shop Backend API is running',
      mode: env.DEMO_MODE ? 'DEMO' : 'PRODUCTION',
      timestamp: new Date().toISOString(),
    });
  });

  // Routes
  app.use('/api/cart', createCartRouter());
  app.use('/api/auth', createAuthRouter());
  app.use('/api/products', createProductRouter());
  app.use('/api/orders', createOrderRouter());
  app.use('/api/checkout', createCheckoutRouter());

  // Auth /me route (requires authentication middleware)
  const authController = new AuthController(authService);
  app.get('/api/auth/me', authenticate, authController.getCurrentUser);

  // Demo admin routes (conditional)
  if (env.DEMO_MODE) {
    const adminRouter = require('../routes/demo/admin');
    app.use('/api/demo/admin', adminRouter);
  }

  // 404 handler (must be AFTER all routes)
  app.use(notFound);

  // Error handler (must be LAST)
  app.use(errorHandler);

  return app;
}
