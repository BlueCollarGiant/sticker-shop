const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class CheckoutController {
  constructor() {
    this.createPaymentIntent = this.createPaymentIntent.bind(this);
  }

  async createPaymentIntent(req, res) {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than zero',
      });
      return;
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe requires cents as integer
        currency,
        automatic_payment_methods: { enabled: true },
      });

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error) {
      console.error('[CheckoutController] Stripe error:', error.message);
      res.status(502).json({
        success: false,
        error: 'Payment provider error',
        message: error.message,
      });
    }
  }
}

module.exports = { CheckoutController };
