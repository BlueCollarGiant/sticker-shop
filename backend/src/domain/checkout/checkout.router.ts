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
