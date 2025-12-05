/**
 * Product Types
 * Frontend type definitions for products (aligned with backend)
 */

export enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  SALE = 'sale',
  LIMITED = 'limited',
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  price?: number;
  stock: number;
  sku: string;
}

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
  variants?: ProductVariant[];
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

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductCatalog {
  totalProducts: number;
  categories: string[];
  collections: string[];
  tags: string[];
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
  badges?: ProductBadge[];
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
  stock?: number;
}
