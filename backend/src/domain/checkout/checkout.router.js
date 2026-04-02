const { Router } = require('express');
const { CheckoutController } = require('./checkout.controller.js');
const { authenticate } = require('../../middleware/auth.middleware.js');

function createCheckoutRouter() {
  const router = Router();

  const checkoutController = new CheckoutController();

  router.get('/config', (req, res) => {
    res.json({
      success: true,
      data: { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY }
    });
  });

  router.use(authenticate);

  router.post('/create-payment-intent', checkoutController.createPaymentIntent);

  return router;
}

module.exports = { createCheckoutRouter };
