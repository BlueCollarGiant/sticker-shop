import express, { Express } from 'express';
import cors from 'cors';
import { env, getAllowedOrigins } from './config/env';
import { createCartRouter } from './domain/cart/cart.router';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';

// Import existing routes (will migrate these later)
const authRouter = require('../routes/auth');
const productsRouter = require('../routes/products');
const ordersRouter = require('../routes/orders');

/**
 * Create and configure Express application
 */
export function createApp(): Express {
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
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);

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
