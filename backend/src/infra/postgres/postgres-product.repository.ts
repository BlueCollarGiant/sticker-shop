/**
 * PostgreSQL Product Repository (disabled)
 * Placeholder to keep interface parity while demo mode is enforced.
 */

import {
  IProductRepository,
  Product,
  ProductListResult,
  CreateProductInput,
  UpdateProductInput,
  ProductCatalog,
} from '../../domain/products/product.types';

const POSTGRES_DISABLED_MESSAGE = 'PostgresProductRepository is disabled; use DemoProductStore while demo mode is active.';

export class PostgresProductRepository implements IProductRepository {
  private notSupported<T>(): Promise<T> {
    return Promise.reject(new Error(POSTGRES_DISABLED_MESSAGE));
  }

  async getAll(): Promise<ProductListResult> {
    return this.notSupported();
  }

  async getById(id: string): Promise<Product> {
    return this.notSupported();
  }

  async create(input: CreateProductInput): Promise<Product> {
    return this.notSupported();
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    return this.notSupported();
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return this.notSupported();
  }

  async updateStock(id: string, stock: number): Promise<Product> {
    return this.notSupported();
  }

  async toggleBadge(id: string, badge: string): Promise<Product> {
    return this.notSupported();
  }

  async getCatalog(): Promise<ProductCatalog> {
    return this.notSupported();
  }
}
