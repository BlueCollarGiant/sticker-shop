import { Product, ProductCategory, ProductCollection, ProductBadge } from '../../models/product.model';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Read by Moonlight',
    subtitle: 'Vinyl Sticker',
    description: 'A premium vinyl sticker featuring a crescent moon and open book design. Perfect for laptops, water bottles, and journals. Weather-resistant and fade-proof.',
    price: 4.99,
    category: ProductCategory.STICKERS,
    collection: ProductCollection.DARK_ACADEMIA,
    images: [
      {
        id: 'img1',
        url: 'https://via.placeholder.com/600x600/1A1410/E8DCC4?text=Read+by+Moonlight',
        alt: 'Read by Moonlight Sticker',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [],
    tags: ['reading', 'moon', 'literary'],
    badges: [ProductBadge.BESTSELLER],
    rating: 4.8,
    reviewCount: 28,
    isNew: false,
    isBestseller: true,
    isLimitedEdition: false,
    stock: 150,
    createdAt: new Date('2025-01-15')
  },
  {
    id: '2',
    title: 'Discipline & Iron',
    subtitle: 'Premium T-Shirt',
    description: 'Soft cotton blend t-shirt with minimalist "Discipline & Iron" design. Represents the balance of mental and physical training.',
    price: 29.99,
    salePrice: 24.99,
    category: ProductCategory.APPAREL,
    collection: ProductCollection.MIDNIGHT_MINIMALIST,
    images: [
      {
        id: 'img2',
        url: 'https://via.placeholder.com/600x600/0A1628/D4D8DD?text=Discipline+%26+Iron',
        alt: 'Discipline & Iron T-Shirt',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [
      { id: 'v1', size: 'S', stock: 20, sku: 'DI-TS-S' },
      { id: 'v2', size: 'M', stock: 35, sku: 'DI-TS-M' },
      { id: 'v3', size: 'L', stock: 40, sku: 'DI-TS-L' },
      { id: 'v4', size: 'XL', stock: 25, sku: 'DI-TS-XL' }
    ],
    tags: ['training', 'minimalist', 'discipline'],
    badges: [ProductBadge.SALE],
    rating: 4.9,
    reviewCount: 42,
    isNew: false,
    isBestseller: false,
    isLimitedEdition: false,
    stock: 120,
    createdAt: new Date('2025-01-10')
  },
  {
    id: '3',
    title: 'Mythic Warrior',
    subtitle: 'Vinyl Sticker',
    description: 'Ancient warrior symbol with runic accents. For those who walk the heroic path.',
    price: 4.99,
    category: ProductCategory.STICKERS,
    collection: ProductCollection.MYTHIC_FANTASY,
    images: [
      {
        id: 'img3',
        url: 'https://via.placeholder.com/600x600/2B1B3D/C9A961?text=Mythic+Warrior',
        alt: 'Mythic Warrior Sticker',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [],
    tags: ['fantasy', 'warrior', 'mythology'],
    badges: [ProductBadge.NEW],
    rating: 4.7,
    reviewCount: 15,
    isNew: true,
    isBestseller: false,
    isLimitedEdition: false,
    stock: 200,
    createdAt: new Date('2025-02-01')
  },
  {
    id: '4',
    title: 'Quiet Hours Coffee Mug',
    subtitle: '12oz Ceramic',
    description: '"In the quiet hours, we become." Premium ceramic mug perfect for your early morning coffee or late-night tea.',
    price: 16.99,
    category: ProductCategory.MUGS,
    collection: ProductCollection.DARK_ACADEMIA,
    images: [
      {
        id: 'img4',
        url: 'https://via.placeholder.com/600x600/1A1410/D4A574?text=Quiet+Hours+Mug',
        alt: 'Quiet Hours Coffee Mug',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [],
    tags: ['coffee', 'quote', 'morning'],
    badges: [ProductBadge.BESTSELLER],
    rating: 4.9,
    reviewCount: 67,
    isNew: false,
    isBestseller: true,
    isLimitedEdition: false,
    stock: 85,
    createdAt: new Date('2025-01-05')
  },
  {
    id: '5',
    title: 'Night Reader Hoodie',
    subtitle: 'Premium Heavyweight',
    description: 'Ultra-soft heavyweight hoodie with embroidered Night Reader logo. Perfect for those early morning training sessions or late-night reading.',
    price: 54.99,
    category: ProductCategory.APPAREL,
    collection: ProductCollection.MIDNIGHT_MINIMALIST,
    images: [
      {
        id: 'img5',
        url: 'https://via.placeholder.com/600x600/2C3540/E8DCC4?text=Night+Reader+Hoodie',
        alt: 'Night Reader Hoodie',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [
      { id: 'v5', size: 'S', color: 'Midnight Black', colorHex: '#0A1628', stock: 15, sku: 'NR-HD-S-BLK' },
      { id: 'v6', size: 'M', color: 'Midnight Black', colorHex: '#0A1628', stock: 25, sku: 'NR-HD-M-BLK' },
      { id: 'v7', size: 'L', color: 'Midnight Black', colorHex: '#0A1628', stock: 30, sku: 'NR-HD-L-BLK' },
      { id: 'v8', size: 'XL', color: 'Midnight Black', colorHex: '#0A1628', stock: 20, sku: 'NR-HD-XL-BLK' }
    ],
    tags: ['hoodie', 'premium', 'embroidered'],
    badges: [ProductBadge.BESTSELLER],
    rating: 5.0,
    reviewCount: 89,
    isNew: false,
    isBestseller: true,
    isLimitedEdition: false,
    stock: 90,
    createdAt: new Date('2025-01-01')
  },
  {
    id: '6',
    title: 'Runes & Pages',
    subtitle: 'Metal Bookmark',
    description: 'Laser-etched metal bookmark with runic design. Marks your progress in style.',
    price: 12.99,
    category: ProductCategory.BOOKMARKS,
    collection: ProductCollection.MYTHIC_FANTASY,
    images: [
      {
        id: 'img6',
        url: 'https://via.placeholder.com/600x600/0F0F14/C9A961?text=Runes+%26+Pages',
        alt: 'Runes & Pages Bookmark',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [],
    tags: ['bookmark', 'metal', 'runes'],
    badges: [ProductBadge.LIMITED],
    rating: 4.6,
    reviewCount: 23,
    isNew: false,
    isBestseller: false,
    isLimitedEdition: true,
    stock: 50,
    createdAt: new Date('2025-01-20')
  },
  {
    id: '7',
    title: 'Build Yourself',
    subtitle: 'Motivational Poster',
    description: '18x24" museum-quality poster. "Read Deep. Train Hard. Build Yourself." Printed on premium matte paper.',
    price: 24.99,
    category: ProductCategory.POSTERS,
    collection: ProductCollection.MIDNIGHT_MINIMALIST,
    images: [
      {
        id: 'img7',
        url: 'https://via.placeholder.com/600x800/1C1F26/E8DCC4?text=Build+Yourself',
        alt: 'Build Yourself Poster',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [],
    tags: ['poster', 'motivation', 'wall-art'],
    badges: [ProductBadge.NEW],
    rating: 4.8,
    reviewCount: 31,
    isNew: true,
    isBestseller: false,
    isLimitedEdition: false,
    stock: 75,
    createdAt: new Date('2025-01-28')
  },
  {
    id: '8',
    title: 'Moonlit Path Phone Case',
    subtitle: 'Slim Protection',
    description: 'Slim profile phone case with moon phase design. Available for iPhone and Samsung models.',
    price: 19.99,
    category: ProductCategory.PHONE_CASES,
    collection: ProductCollection.MYTHIC_FANTASY,
    images: [
      {
        id: 'img8',
        url: 'https://via.placeholder.com/600x600/2B1B3D/E6D5B8?text=Moonlit+Path',
        alt: 'Moonlit Path Phone Case',
        isPrimary: true,
        order: 1
      }
    ],
    variants: [
      { id: 'v9', size: 'iPhone 14', stock: 30, sku: 'MP-PC-IP14' },
      { id: 'v10', size: 'iPhone 15', stock: 40, sku: 'MP-PC-IP15' },
      { id: 'v11', size: 'Samsung S23', stock: 25, sku: 'MP-PC-S23' }
    ],
    tags: ['phone-case', 'moon', 'protection'],
    badges: [],
    rating: 4.7,
    reviewCount: 44,
    isNew: false,
    isBestseller: false,
    isLimitedEdition: false,
    stock: 95,
    createdAt: new Date('2025-01-18')
  }
];
