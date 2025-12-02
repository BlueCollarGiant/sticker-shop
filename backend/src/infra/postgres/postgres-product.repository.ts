/**
 * PostgreSQL Product Repository
 * Implements IProductRepository using Prisma + PostgreSQL
 */

import { prisma } from './prisma-client';
import {
  IProductRepository,
  Product,
  ProductListResult,
  CreateProductInput,
  UpdateProductInput,
  ProductCatalog,
  ProductBadge,
} from '../../domain/products/product.types';

export class PostgresProductRepository implements IProductRepository {
  /**
   * Get all products with pagination support
   */
  async getAll(): Promise<ProductListResult> {
    const products = await prisma.product.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedProducts = products.map(this.mapToProduct);

    return {
      data: mappedProducts,
      total: mappedProducts.length,
      page: 1,
      limit: mappedProducts.length,
    };
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    return this.mapToProduct(product);
  }

  /**
   * Create a new product
   */
  async create(input: CreateProductInput): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice,
        category: input.category,
        collection: input.collection,
        tags: input.tags,
        badges: input.badges,
        rating: input.rating,
        reviewCount: input.reviewCount,
        isNew: input.isNew,
        isBestseller: input.isBestseller,
        isLimitedEdition: input.isLimitedEdition,
        stock: input.stock,
        images: {
          create: input.images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            order: img.order ?? index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Update an existing product
   */
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    // If images are provided, replace all existing images
    const updateData: any = {
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      price: input.price,
      salePrice: input.salePrice,
      category: input.category,
      collection: input.collection,
      tags: input.tags,
      badges: input.badges,
      rating: input.rating,
      reviewCount: input.reviewCount,
      isNew: input.isNew,
      isBestseller: input.isBestseller,
      isLimitedEdition: input.isLimitedEdition,
      stock: input.stock,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle image updates if provided
    if (input.images) {
      // Delete existing images and create new ones
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      updateData.images = {
        create: input.images.map((img, index) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          order: img.order ?? index,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Product ${id} deleted successfully`,
    };
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, stock: number): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: { stock },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  /**
   * Toggle product badge (add if missing, remove if present)
   */
  async toggleBadge(id: string, badge: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    // Toggle badge
    const badges = product.badges;
    const badgeIndex = badges.indexOf(badge);

    let updatedBadges: string[];
    if (badgeIndex > -1) {
      // Remove badge
      updatedBadges = badges.filter((b) => b !== badge);
    } else {
      // Add badge
      updatedBadges = [...badges, badge];
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { badges: updatedBadges },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.mapToProduct(updatedProduct);
  }

  /**
   * Get catalog metadata (categories, collections, counts)
   */
  async getCatalog(): Promise<ProductCatalog> {
    const products = await prisma.product.findMany({
      select: {
        category: true,
        collection: true,
      },
    });

    // Extract unique categories and collections
    const categories = [...new Set(products.map((p) => p.category))];
    const collections = [...new Set(products.map((p) => p.collection))];

    return {
      categories,
      collections,
      totalProducts: products.length,
    };
  }

  /**
   * Map Prisma Product model to domain Product type
   */
  private mapToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      title: dbProduct.title,
      subtitle: dbProduct.subtitle,
      description: dbProduct.description,
      price: parseFloat(dbProduct.price.toString()),
      salePrice: dbProduct.salePrice ? parseFloat(dbProduct.salePrice.toString()) : undefined,
      category: dbProduct.category,
      collection: dbProduct.collection,
      images: dbProduct.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || '',
        isPrimary: img.isPrimary,
        order: img.order,
      })),
      tags: dbProduct.tags,
      badges: dbProduct.badges as ProductBadge[],
      rating: parseFloat(dbProduct.rating.toString()),
      reviewCount: dbProduct.reviewCount,
      isNew: dbProduct.isNew,
      isBestseller: dbProduct.isBestseller,
      isLimitedEdition: dbProduct.isLimitedEdition,
      stock: dbProduct.stock,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }
}
