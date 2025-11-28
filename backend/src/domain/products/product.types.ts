/**
 * Product Domain Types
 * Core business types for the product domain
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
  images: ProductImage[];
  tags: string[];
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  LIMITED = 'limited',
  SALE = 'sale',
}

export interface ProductCatalog {
  categories: string[];
  collections: string[];
  totalProducts: number;
}

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductInput {
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  collection: string;
  images: ProductImage[];
  tags: string[];
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;
  stock: number;
}

export interface UpdateProductInput {
  title?: string;
  subtitle?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  category?: string;
  collection?: string;
  images?: ProductImage[];
  tags?: string[];
  badges?: ProductBadge[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isLimitedEdition?: boolean;
  stock?: number;
}

/**
 * Product Repository Port (Interface)
 * Defines the contract for product data access
 */
export interface IProductRepository {
  getAll(): Promise<ProductListResult>;
  getById(id: string): Promise<Product>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<{ success: boolean; message: string }>;
  updateStock(id: string, stock: number): Promise<Product>;
  toggleBadge(id: string, badge: string): Promise<Product>;
  getCatalog(): Promise<ProductCatalog>;
}
