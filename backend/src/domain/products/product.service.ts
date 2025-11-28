/**
 * Product Service
 * Business logic for product operations
 */

import {
  IProductRepository,
  Product,
  ProductListResult,
  CreateProductInput,
  UpdateProductInput,
  ProductCatalog,
} from './product.types';

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async getAllProducts(): Promise<ProductListResult> {
    return this.productRepository.getAll();
  }

  async getProductById(id: string): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }
    return this.productRepository.getById(id);
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    // Validate required fields
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

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    // Validate fields if provided
    if (input.price !== undefined && (typeof input.price !== 'number' || input.price < 0)) {
      throw new Error('Valid product price is required');
    }
    if (input.stock !== undefined && (typeof input.stock !== 'number' || input.stock < 0)) {
      throw new Error('Valid stock quantity is required');
    }

    return this.productRepository.update(id, input);
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    if (!id) {
      throw new Error('Product ID is required');
    }
    return this.productRepository.delete(id);
  }

  async updateProductStock(id: string, stock: number): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }
    if (typeof stock !== 'number' || stock < 0) {
      throw new Error('Valid stock quantity is required');
    }
    return this.productRepository.updateStock(id, stock);
  }

  async toggleProductBadge(id: string, badge: string): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }
    if (!badge) {
      throw new Error('Badge is required');
    }
    return this.productRepository.toggleBadge(id, badge);
  }

  async getCatalog(): Promise<ProductCatalog> {
    return this.productRepository.getCatalog();
  }
}
