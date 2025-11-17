const axios = require('axios');

class PrintifyService {
  constructor() {
    this.apiKey = process.env.PRINTIFY_API_KEY;
    this.shopId = process.env.PRINTIFY_SHOP_ID;
    this.baseURL = 'https://api.printify.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getShops() {
    try {
      const response = await this.client.get('/shops.json');
      return response.data;
    } catch (error) {
      console.error('Error fetching shops:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProducts() {
    try {
      if (!this.shopId) {
        throw new Error('PRINTIFY_SHOP_ID is not configured');
      }
      const response = await this.client.get(`/shops/${this.shopId}/products.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      const response = await this.client.get(`/shops/${this.shopId}/products/${productId}.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCatalog() {
    try {
      const response = await this.client.get('/catalog/blueprints.json');
      return response.data;
    } catch (error) {
      console.error('Error fetching catalog:', error.response?.data || error.message);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      const response = await this.client.post(`/shops/${this.shopId}/orders.json`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrders() {
    try {
      const response = await this.client.get(`/shops/${this.shopId}/orders.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const response = await this.client.get(`/shops/${this.shopId}/orders/${orderId}.json`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new PrintifyService();
