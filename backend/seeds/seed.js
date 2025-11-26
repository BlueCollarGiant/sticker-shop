#!/usr/bin/env node

/**
 * Database Seeder
 *
 * This script seeds the database with initial product data.
 * Usage: npm run seed
 */

const fs = require('fs');
const path = require('path');
const products = require('./products');

const DATA_DIR = path.join(__dirname, '../data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'demo-products.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('✓ Created data directory');
}

// Write products to file
try {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log('✓ Successfully seeded products data');
  console.log(`  → ${products.length} products written to ${PRODUCTS_FILE}`);

  // Display summary
  const categories = [...new Set(products.map(p => p.category))];
  const collections = [...new Set(products.map(p => p.collection))];

  console.log('\nSummary:');
  console.log(`  Products: ${products.length}`);
  console.log(`  Categories: ${categories.join(', ')}`);
  console.log(`  Collections: ${collections.join(', ')}`);

  const bestsellers = products.filter(p => p.isBestseller).length;
  const newItems = products.filter(p => p.isNew).length;
  const limited = products.filter(p => p.isLimitedEdition).length;

  console.log(`\nBadges:`);
  console.log(`  Bestsellers: ${bestsellers}`);
  console.log(`  New Items: ${newItems}`);
  console.log(`  Limited Edition: ${limited}`);

  console.log('\n✓ Seeding complete!');
} catch (error) {
  console.error('✗ Error seeding products:', error.message);
  process.exit(1);
}
