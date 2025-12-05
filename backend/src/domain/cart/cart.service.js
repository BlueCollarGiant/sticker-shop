const { CART_CONSTANTS } = require('./cart.constants.js');

class CartService {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async getCart(userId) {
    const cart = await this.cartRepository.getCart(userId);

    if (!cart) {
      return {
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return cart;
  }

  async addItem(input) {
    if (input.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (input.price < 0) {
      throw new Error('Price cannot be negative');
    }

    return this.cartRepository.addItem(input);
  }

  async updateItem(input) {
    if (input.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (input.quantity === 0) {
      return this.cartRepository.removeItem({
        userId: input.userId,
        itemId: input.itemId,
      });
    }

    return this.cartRepository.updateItem(input);
  }

  async removeItem(input) {
    return this.cartRepository.removeItem(input);
  }

  async clearCart(userId) {
    return this.cartRepository.clearCart(userId);
  }

  calculateTotals(cart) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shipping = subtotal >= CART_CONSTANTS.FREE_SHIPPING_THRESHOLD
      ? 0
      : CART_CONSTANTS.SHIPPING_COST;
    const tax = subtotal * CART_CONSTANTS.TAX_RATE;
    const total = subtotal + shipping + tax;
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount,
    };
  }
}

module.exports = { CartService };
