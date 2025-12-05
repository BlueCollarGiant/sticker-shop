const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');

function ensureStore() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true });
    fs.writeFileSync(PRODUCTS_FILE, '[]', 'utf-8');
  }
}

function loadProducts() {
  ensureStore();
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

function computeDefaultSalePrice(price) {
  const discounted = price * 0.9;
  return Math.round(discounted * 100) / 100;
}

class FileProductRepository {
  async getAll() {
    const products = loadProducts();
    return {
      data: products,
      total: products.length,
      page: 1,
      limit: products.length,
    };
  }

  async getById(id) {
    const products = loadProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      throw new Error(`Product ${id} not found`);
    }

    return product;
  }

  async create(productData) {
    const products = loadProducts();

    const newProduct = {
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    saveProducts(products);

    return newProduct;
  }

  async update(id, updateData) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    products[index] = {
      ...products[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    saveProducts(products);
    return products[index];
  }

  async delete(id) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    products.splice(index, 1);
    saveProducts(products);

    return { success: true, message: 'Product deleted successfully' };
  }

  async updateStock(id, stock) {
    return this.update(id, { stock });
  }

  async toggleBadge(id, badge) {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product ${id} not found`);
    }

    const product = products[index];
    const badges = Array.isArray(product.badges) ? [...product.badges] : [];
    const hasBadge = badges.includes(badge);

    const updatedBadges = hasBadge
      ? badges.filter(b => b !== badge)
      : [...badges, badge];

    const updates = {
      badges: updatedBadges,
      updatedAt: new Date().toISOString(),
    };

    if (badge === 'new') updates.isNew = updatedBadges.includes('new');
    if (badge === 'bestseller') updates.isBestseller = updatedBadges.includes('bestseller');
    if (badge === 'limited') updates.isLimitedEdition = updatedBadges.includes('limited');
    if (badge === 'sale') {
      const saleEnabled = updatedBadges.includes('sale');
      updates.isSale = saleEnabled;

      if (saleEnabled) {
        const salePrice = product.salePrice ?? computeDefaultSalePrice(product.price);
        updates.salePrice = salePrice;
      } else {
        updates.salePrice = undefined;
      }
    }

    products[index] = {
      ...product,
      ...updates,
    };

    saveProducts(products);
    return products[index];
  }

  async getCatalog() {
    const products = loadProducts();

    const categories = [...new Set(products.map(p => p.category))];
    const collections = [...new Set(products.map(p => p.collection))];

    return {
      success: true,
      data: {
        categories,
        collections,
        totalProducts: products.length,
      },
    };
  }

  async isEmpty() {
    return loadProducts().length === 0;
  }
}

module.exports = new FileProductRepository();
