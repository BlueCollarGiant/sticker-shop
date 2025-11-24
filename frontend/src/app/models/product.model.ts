export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  salePrice?: number;
  category: ProductCategory | string;
  collection: ProductCollection | string;
  images: ProductImage[] | string[];
  variants: ProductVariant[];
  tags: string[];
  badges?: ProductBadge[] | string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isLimitedEdition: boolean;
  stock: number;
  createdAt: Date;
}

export enum ProductCategory {
  STICKERS = 'stickers',
  APPAREL = 'apparel',
  MUGS = 'mugs',
  POSTERS = 'posters',
  BOOKMARKS = 'bookmarks',
  PHONE_CASES = 'phone-cases'
}

export enum ProductCollection {
  DARK_ACADEMIA = 'dark-academia',
  MIDNIGHT_MINIMALIST = 'midnight-minimalist',
  MYTHIC_FANTASY = 'mythic-fantasy'
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

export enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  LIMITED = 'limited',
  SALE = 'sale'
}

export interface FilterState {
  categories: ProductCategory[];
  collections: ProductCollection[];
  priceRange: PriceRange;
  sortBy: SortOption;
}

export interface PriceRange {
  min: number;
  max: number;
}

export enum SortOption {
  NEWEST = 'newest',
  POPULAR = 'popular',
  PRICE_LOW_HIGH = 'price-asc',
  PRICE_HIGH_LOW = 'price-desc',
  NAME_A_Z = 'name-asc'
}
