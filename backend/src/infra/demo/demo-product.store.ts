/**
 * Demo Product Store - File-based product storage implementing IProductRepository
 * Async file operations with caching
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  IProductRepository,
  Product,
  ProductListResult,
  CreateProductInput,
  UpdateProductInput,
  ProductCatalog,
  ProductImage,
  ProductBadge,
} from '../../domain/products/product.types';

export class DemoProductStore implements IProductRepository {
  private productsFile: string;
  private productsCache: Product[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds

  constructor() {
    this.productsFile = path.join(__dirname, '../../../data/demo-products.json');
  }

  /**
   * Load products from file (async with caching)
   */
  private async loadProducts(): Promise<Product[]> {
    const now = Date.now();

    // Return cached products if fresh
    if (this.productsCache && now - this.cacheTime < this.CACHE_TTL) {
      return this.productsCache;
    }

    try {
      const data = await fs.readFile(this.productsFile, 'utf8');
      const rawProducts = JSON.parse(data);

      // Convert date strings to Date objects
      this.productsCache = rawProducts.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
      }));

      this.cacheTime = now;
      return this.productsCache!;
    } catch (error) {
      console.error('Error loading demo products:', error);
      return [];
    }
  }

  /**
   * Save products to file (async)
   */
  private async saveProducts(products: Product[]): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.productsFile);
      await fs.mkdir(dataDir, { recursive: true });

      await fs.writeFile(this.productsFile, JSON.stringify(products, null, 2), 'utf8');
      this.productsCache = products;
      this.cacheTime = Date.now();
    } catch (error) {
      console.error('Error saving demo products:', error);
      throw new Error('Failed to save products');
    }
  }

  async getAll(): Promise<ProductListResult> {
    const products = await this.loadProducts();
    return {
      data: products,
      total: products.length,
      page: 1,
      limit: 100,
    };
  }

  async getById(id: string): Promise<Product> {
    const products = await this.loadProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    return product;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const products = await this.loadProducts();

    // Generate new ID
    const maxId = products.reduce((max, p) => {
      const numId = parseInt(p.id);
      return numId > max ? numId : max;
    }, 0);

    const now = new Date();
    const newProduct: Product = {
      ...input,
      id: String(maxId + 1),
      createdAt: now,
      updatedAt: now,
    };

    products.push(newProduct);
    await this.saveProducts(products);

    return newProduct;
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const products = await this.loadProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    products[index] = {
      ...products[index],
      ...input,
      id, // Preserve ID
      updatedAt: new Date(),
    };

    await this.saveProducts(products);
    return products[index];
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const products = await this.loadProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    products.splice(index, 1);
    await this.saveProducts(products);

    return { success: true, message: 'Product deleted successfully' };
  }

  async updateStock(id: string, stock: number): Promise<Product> {
    return this.update(id, { stock });
  }

  async toggleBadge(id: string, badge: string): Promise<Product> {
    const product = await this.getById(id);

    const badges = [...product.badges];
    const badgeIndex = badges.findIndex(b => b === badge);

    if (badgeIndex > -1) {
      badges.splice(badgeIndex, 1);
    } else {
      badges.push(badge as ProductBadge);
    }

    const updates: UpdateProductInput = { badges };

    // Update corresponding boolean flags
    switch (badge) {
      case 'new':
        updates.isNew = !product.isNew;
        break;
      case 'bestseller':
        updates.isBestseller = !product.isBestseller;
        break;
      case 'limited':
        updates.isLimitedEdition = !product.isLimitedEdition;
        break;
    }

    return this.update(id, updates);
  }

  async getCatalog(): Promise<ProductCatalog> {
    const products = await this.loadProducts();

    const categories = [...new Set(products.map(p => p.category))];
    const collections = [...new Set(products.map(p => p.collection))];

    return {
      categories,
      collections,
      totalProducts: products.length,
    };
  }

  /**
   * Initialize store with products (for seeding)
   */
  async initializeWithProducts(products: Product[]): Promise<void> {
    await this.saveProducts(products);
    console.log(`[SEED] Initialized ${products.length} products`);
  }

  /**
   * Check if store is empty
   */
  async isEmpty(): Promise<boolean> {
    const products = await this.loadProducts();
    return products.length === 0;
  }
}
