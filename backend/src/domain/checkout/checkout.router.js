const { Router } = require('express');
const { CheckoutController } = require('./checkout.controller');
const { authenticate } = require('../../middleware/auth.middleware');

function createCheckoutRouter() {
  const router = Router();

  const checkoutController = new CheckoutController();

  router.use(authenticate);

  router.post('/create-payment-intent', checkoutController.createPaymentIntent);

  return router;
}

module.exports = { createCheckoutRouter };
