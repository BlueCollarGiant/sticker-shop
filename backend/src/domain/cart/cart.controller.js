class CartController {
  constructor(cartService) {
    this.cartService = cartService;
  }

  getCart = async (req, res, next) => {
    try {
      const userId = req.user?.userId || 'guest';

      const cart = await this.cartService.getCart(userId);
      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  addItem = async (req, res, next) => {
    try {
      const userId = req.user?.userId || 'guest';
      const { productId, variantId, quantity, price, title, imageUrl } = req.body;

      const cart = await this.cartService.addItem({
        userId,
        productId,
        variantId,
        quantity,
        price,
        title,
        imageUrl,
      });

      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        message: 'Item added to cart',
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req, res, next) => {
    try {
      const userId = req.user?.userId || 'guest';
      const itemId = req.params.id;
      const { quantity } = req.body;

      const cart = await this.cartService.updateItem({
        userId,
        itemId,
        quantity,
      });

      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        message: 'Cart updated',
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req, res, next) => {
    try {
      const userId = req.user?.userId || 'guest';
      const itemId = req.params.id;

      const cart = await this.cartService.removeItem({
        userId,
        itemId,
      });

      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req, res, next) => {
    try {
      const userId = req.user?.userId || 'guest';

      await this.cartService.clearCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: {
          cart: {
            userId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          totals: {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            itemCount: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { CartController };
