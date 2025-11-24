const fs = require('fs');
const path = require('path');

class MockDataService {
  constructor() {
    this.productsFile = path.join(__dirname, '../data/demo-products.json');
    this.products = this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.productsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading demo products:', error);
      return [];
    }
  }

  saveProducts() {
    try {
      fs.writeFileSync(this.productsFile, JSON.stringify(this.products, null, 2));
    } catch (error) {
      console.error('Error saving demo products:', error);
    }
  }

  getAll() {
    return {
      data: this.products,
      total: this.products.length,
      page: 1,
      limit: 20
    };
  }

  getById(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  }

  create(productData) {
    // Generate new ID
    const maxId = this.products.reduce((max, p) => {
      const numId = parseInt(p.id);
      return numId > max ? numId : max;
    }, 0);

    const newProduct = {
      ...productData,
      id: String(maxId + 1),
      createdAt: new Date().toISOString()
    };

    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  update(id, productData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    this.products[index] = {
      ...this.products[index],
      ...productData,
      id // Keep the original ID
    };

    this.saveProducts();
    return this.products[index];
  }

  delete(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    this.products.splice(index, 1);
    this.saveProducts();
    return { success: true, message: 'Product deleted successfully' };
  }

  updateStock(id, stock) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    product.stock = stock;
    this.saveProducts();
    return product;
  }

  toggleBadge(id, badge) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    if (!product.badges) {
      product.badges = [];
    }

    const badgeIndex = product.badges.indexOf(badge);
    if (badgeIndex > -1) {
      // Remove badge
      product.badges.splice(badgeIndex, 1);
    } else {
      // Add badge
      product.badges.push(badge);
    }

    // Update corresponding boolean flags
    switch(badge) {
      case 'new':
        product.isNew = !product.isNew;
        break;
      case 'bestseller':
        product.isBestseller = !product.isBestseller;
        break;
      case 'limited':
        product.isLimitedEdition = !product.isLimitedEdition;
        break;
    }

    this.saveProducts();
    return product;
  }

  getCatalog() {
    // Return unique categories and collections
    const categories = [...new Set(this.products.map(p => p.category))];
    const collections = [...new Set(this.products.map(p => p.collection))];

    return {
      categories,
      collections,
      totalProducts: this.products.length
    };
  }
}

module.exports = new MockDataService();
