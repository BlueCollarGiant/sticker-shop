/**
 * Product Seed Data (TypeScript)
 * Seed data for initializing the product store
 */

import { Product, ProductBadge } from '../domain/products/product.types';

export const productSeeds: Omit<Product, 'updatedAt'>[] = [
  {
    id: "1",
    title: "Read by Moonlight",
    subtitle: "Vinyl Sticker",
    description: "A premium vinyl sticker featuring a crescent moon and open book design. Perfect for laptops, water bottles, and journals. Weather-resistant and fade-proof.",
    price: 4.99,
    category: "stickers",
    collection: "dark-academia",
    images: [
      {
        id: "img1",
        url: "https://placehold.co/600x600/1A1410/E8DCC4?text=Read+by+Moonlight",
        alt: "Read by Moonlight Sticker",
        isPrimary: true,
        order: 1
      }
    ],
    tags: ["reading", "moon", "literary"],
    badges: [ProductBadge.BESTSELLER],
    rating: 4.8,
    reviewCount: 28,
    isNew: false,
    isBestseller: true,
    isLimitedEdition: false,
    stock: 150,
    createdAt: new Date("2025-01-15T00:00:00.000Z")
  },
  {
    id: "2",
    title: "Discipline & Iron",
    subtitle: "Premium T-Shirt",
    description: "Soft cotton blend t-shirt with minimalist \"Discipline & Iron\" design. Represents the balance of mental and physical training.",
    price: 29.99,
    salePrice: 24.99,
    category: "apparel",
    collection: "midnight-minimalist",
    images: [
      {
        id: "img2",
        url: "https://placehold.co/600x600/0A1628/D4D8DD?text=Discipline+%26+Iron",
        alt: "Discipline & Iron T-Shirt",
        isPrimary: true,
        order: 1
      }
    ],
    tags: ["training", "minimalist", "discipline"],
    badges: [ProductBadge.SALE],
    rating: 4.9,
    reviewCount: 42,
    isNew: false,
    isBestseller: false,
    isLimitedEdition: false,
    stock: 120,
    createdAt: new Date("2025-01-10T00:00:00.000Z")
  },
  {
    id: "3",
    title: "Mythic Warrior",
    subtitle: "Vinyl Sticker",
    description: "Ancient warrior symbol with runic accents. For those who walk the heroic path.",
    price: 4.99,
    category: "stickers",
    collection: "mythic-fantasy",
    images: [
      {
        id: "img3",
        url: "https://placehold.co/600x600/2B1B3D/C9A961?text=Mythic+Warrior",
        alt: "Mythic Warrior Sticker",
        isPrimary: true,
        order: 1
      }
    ],
    tags: ["fantasy", "warrior", "mythology"],
    badges: [ProductBadge.NEW],
    rating: 4.7,
    reviewCount: 15,
    isNew: true,
    isBestseller: false,
    isLimitedEdition: false,
    stock: 200,
    createdAt: new Date("2025-02-01T00:00:00.000Z")
  },
  {
    id: "4",
    title: "Quiet Hours Coffee Mug",
    subtitle: "12oz Ceramic",
    description: "\"In the quiet hours, we become.\" Premium ceramic mug perfect for your early morning coffee or late-night tea.",
    price: 16.99,
    category: "mugs",
    collection: "dark-academia",
    images: [
      {
        id: "img4",
        url: "https://placehold.co/600x600/1A1410/D4A574?text=Quiet+Hours+Mug",
        alt: "Quiet Hours Coffee Mug",
        isPrimary: true,
        order: 1
      }
    ],
    tags: ["coffee", "quote", "morning"],
    badges: [ProductBadge.BESTSELLER],
    rating: 4.9,
    reviewCount: 67,
    isNew: false,
    isBestseller: true,
    isLimitedEdition: false,
    stock: 85,
    createdAt: new Date("2025-01-05T00:00:00.000Z")
  },
  {
    id: "5",
    title: "Night Reader Hoodie",
    subtitle: "Premium Heavyweight",
    description: "Ultra-soft heavyweight hoodie with embroidered Night Reader logo. Perfect for those early morning training sessions or late-night reading.",
    price: 54.99,
    category: "apparel",
    collection: "midnight-minimalist",
    images: [
      {
        id: "img5",
        url: "https://placehold.co/600x600/2C3540/E8DCC4?text=Night+Reader+Hoodie",
        alt: "Night Reader Hoodie",
        isPrimary: true,
        order: 1
      }
    ],
    tags: ["hoodie", "premium", "training"],
    badges: [ProductBadge.LIMITED],
    rating: 5.0,
    reviewCount: 89,
    isNew: false,
    isBestseller: true,
    isLimitedEdition: true,
    stock: 45,
    createdAt: new Date("2024-12-20T00:00:00.000Z")
  }
];
