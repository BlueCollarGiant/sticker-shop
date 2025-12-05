class CheckoutController {
  constructor() {
    this.createPaymentIntent = this.createPaymentIntent.bind(this);
  }

  async createPaymentIntent(req, res) {
    try {
      const { amount, currency = 'usd' } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid amount',
          message: 'Amount must be greater than zero',
        });
        return;
      }

      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: Math.round(amount * 100),
        currency,
        status: 'requires_payment_method',
      };

      res.json({
        success: true,
        data: {
          clientSecret: mockPaymentIntent.client_secret,
          paymentIntentId: mockPaymentIntent.id,
        },
        message: 'Payment intent created (mock - Stripe not yet integrated)',
      });
    } catch (error) {
      console.error('[CheckoutController] Create payment intent error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment intent',
        message: error.message,
      });
    }
  }
}

module.exports = { CheckoutController };
