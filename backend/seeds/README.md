# Database Seeds

This directory contains seed data for populating the demo database.

## Files

- **products.js** - Product catalog data with all product details
- **seed.js** - Main seeding script that writes data to `data/demo-products.json`

## Usage

### Seed the Database

From the `backend` directory, run:

```bash
npm run seed
```

This will:
1. Create the `data` directory if it doesn't exist
2. Write all products to `data/demo-products.json`
3. Display a summary of seeded data

### Modifying Seed Data

To add or modify products:

1. Edit `seeds/products.js`
2. Add/modify product objects in the array
3. Run `npm run seed` to apply changes

### Product Schema

Each product should have the following structure:

```javascript
{
  id: "unique-id",
  title: "Product Name",
  subtitle: "Product Type",
  description: "Detailed description",
  price: 0.00,
  salePrice: 0.00,        // Optional
  category: "category-name",
  collection: "collection-name",
  images: [
    {
      id: "img-id",
      url: "image-url",
      alt: "alt text",
      isPrimary: true,
      order: 1
    }
  ],
  variants: [],           // Optional - for size/color options
  tags: [],              // Search tags
  badges: [],            // new, bestseller, limited, sale
  rating: 0.0,
  reviewCount: 0,
  isNew: false,
  isBestseller: false,
  isLimitedEdition: false,
  stock: 0,
  createdAt: "ISO-8601-date"
}
```

## Categories

Current categories:
- stickers
- apparel
- mugs
- bookmarks
- posters
- phone-cases

## Collections

Current collections:
- dark-academia
- midnight-minimalist
- mythic-fantasy

## Badges

Available badge types:
- `new` - New arrival
- `bestseller` - Top selling item
- `limited` - Limited edition
- `sale` - On sale (requires salePrice)
