import { promises as fs } from 'fs';
import path from 'path';

/**
 * Demo Product Store - Async file-based product storage
 *
 * Replaces old mock-data.service.js with:
 * - Async file operations (non-blocking)
 * - TypeScript types
 * - Error handling
 */

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  collection: string;
  images: any[];
  variants: any[];
  tags: string[];
  badges: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;
  stock: number;
  createdAt: string;
}

export class DemoProductStore {
  private productsFile: string;
  private productsCache: Product[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds

  constructor() {
    this.productsFile = path.join(__dirname, '../../../data/demo-products.json');
  }

  /**
   * Load products from file (async)
   */
  private async loadProducts(): Promise<Product[]> {
    const now = Date.now();

    // Return cached products if fresh
    if (this.productsCache && now - this.cacheTime < this.CACHE_TTL) {
      return this.productsCache;
    }

    try {
      const data = await fs.readFile(this.productsFile, 'utf8');
      this.productsCache = JSON.parse(data);
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
      await fs.writeFile(this.productsFile, JSON.stringify(products, null, 2), 'utf8');
      this.productsCache = products;
      this.cacheTime = Date.now();
    } catch (error) {
      console.error('Error saving demo products:', error);
      throw new Error('Failed to save products');
    }
  }

  async getAll(): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const products = await this.loadProducts();
    return {
      data: products,
      total: products.length,
      page: 1,
      limit: 20,
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

  async create(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const products = await this.loadProducts();

    const maxId = products.reduce((max, p) => {
      const numId = parseInt(p.id);
      return numId > max ? numId : max;
    }, 0);

    const newProduct: Product = {
      ...productData,
      id: String(maxId + 1),
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);
    await this.saveProducts(products);

    return newProduct;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const products = await this.loadProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    products[index] = {
      ...products[index],
      ...productData,
      id, // Keep original ID
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

    const badges = product.badges || [];
    const badgeIndex = badges.indexOf(badge);

    if (badgeIndex > -1) {
      badges.splice(badgeIndex, 1);
    } else {
      badges.push(badge);
    }

    const updates: Partial<Product> = { badges };

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

  async getCatalog(): Promise<{ categories: string[]; collections: string[]; totalProducts: number }> {
    const products = await this.loadProducts();

    const categories = [...new Set(products.map(p => p.category))];
    const collections = [...new Set(products.map(p => p.collection))];

    return {
      categories,
      collections,
      totalProducts: products.length,
    };
  }
}
