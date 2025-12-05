class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getAllProducts() {
    const result = await this.productRepository.getAll();
    return {
      data: result.data || [],
      total: result.total ?? (result.data ? result.data.length : 0),
      page: result.page ?? 1,
      limit: result.limit ?? (result.data ? result.data.length : 0),
    };
  }

  async getProductById(id) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    return this.productRepository.getById(id);
  }

  async createProduct(input) {
    if (!input.title || input.title.trim() === '') {
      throw new Error('Product title is required');
    }
    if (!input.description || input.description.trim() === '') {
      throw new Error('Product description is required');
    }
    if (typeof input.price !== 'number' || input.price < 0) {
      throw new Error('Valid product price is required');
    }
    if (typeof input.stock !== 'number' || input.stock < 0) {
      throw new Error('Valid stock quantity is required');
    }

    return this.productRepository.create(input);
  }

  async updateProduct(id, input) {
    if (!id) {
      throw new Error('Product ID is required');
    }

    if (input.price !== undefined && (typeof input.price !== 'number' || input.price < 0)) {
      throw new Error('Valid product price is required');
    }
    if (input.stock !== undefined && (typeof input.stock !== 'number' || input.stock < 0)) {
      throw new Error('Valid stock quantity is required');
    }

    return this.productRepository.update(id, input);
  }

  async deleteProduct(id) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    return this.productRepository.delete(id);
  }

  async updateProductStock(id, stock) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    if (typeof stock !== 'number' || stock < 0) {
      throw new Error('Valid stock quantity is required');
    }
    return this.productRepository.updateStock(id, stock);
  }

  async toggleProductBadge(id, badge) {
    if (!id) {
      throw new Error('Product ID is required');
    }
    if (!badge) {
      throw new Error('Badge is required');
    }
    return this.productRepository.toggleBadge(id, badge);
  }

  async getCatalog() {
    return this.productRepository.getCatalog();
  }
}

module.exports = { ProductService };
