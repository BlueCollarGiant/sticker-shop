const fs = require('fs');
const path = require('path');

const CARTS_FILE = path.join(__dirname, '../../data/carts.json');

function ensureStore() {
  if (!fs.existsSync(CARTS_FILE)) {
    fs.mkdirSync(path.dirname(CARTS_FILE), { recursive: true });
    fs.writeFileSync(CARTS_FILE, '[]', 'utf-8');
  }
}

function loadCarts() {
  ensureStore();
  try {
    const data = fs.readFileSync(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading carts:', error);
    return [];
  }
}

function saveCarts(carts) {
  fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2), 'utf-8');
}

class FileCartRepository {
  async getCart(userId) {
    const carts = loadCarts();
    return carts.find(c => c.userId === userId) || null;
  }

  async addItem(input) {
    const carts = loadCarts();
    let cart = carts.find(c => c.userId === input.userId);

    if (!cart) {
      cart = {
        userId: input.userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      carts.push(cart);
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId === input.productId && item.variantId === input.variantId
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += input.quantity;
    } else {
      const newItem = {
        id: this.generateItemId(),
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        price: input.price,
        title: input.title,
        imageUrl: input.imageUrl,
        addedAt: new Date().toISOString(),
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date().toISOString();
    saveCarts(carts);
    return cart;
  }

  async updateItem(input) {
    const carts = loadCarts();
    const cart = carts.find(c => c.userId === input.userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(i => i.id === input.itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }

    item.quantity = input.quantity;
    cart.updatedAt = new Date().toISOString();

    saveCarts(carts);
    return cart;
  }

  async removeItem(input) {
    const carts = loadCarts();
    const cart = carts.find(c => c.userId === input.userId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item.id !== input.itemId);
    cart.updatedAt = new Date().toISOString();

    saveCarts(carts);
    return cart;
  }

  async clearCart(userId) {
    const carts = loadCarts();
    const index = carts.findIndex(c => c.userId === userId);
    if (index !== -1) {
      carts.splice(index, 1);
      saveCarts(carts);
    }
  }

  generateItemId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { FileCartRepository };
