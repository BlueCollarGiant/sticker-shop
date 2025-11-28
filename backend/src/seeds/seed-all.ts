#!/usr/bin/env node
/**
 * Seed All - Master seeding script
 * Run with: npm run seed
 */

import { DemoProductStore } from '../infra/demo/demo-product.store';
import { DemoAuthStore } from '../infra/demo/demo-auth.store';
import { productSeeds } from './seed-products';
import { Product } from '../domain/products/product.types';

async function seedAll() {
  console.log('\n🌱 Starting database seeding...\n');

  try {
    // Initialize stores
    const productStore = new DemoProductStore();
    const authStore = new DemoAuthStore();

    // Seed users
    await authStore.initializeWithDemoUsers();

    // Prepare products with updatedAt
    const products: Product[] = productSeeds.map(p => ({
      ...p,
      updatedAt: p.createdAt,
    }));

    // Seed products
    await productStore.initializeWithProducts(products);

    // Display summary
    const userCount = await authStore.getUserCount();
    const catalog = await productStore.getCatalog();
    console.log('\n📊 Seed Summary:');
    console.log(`  Users: ${userCount}`);
    console.log(`  Products: ${catalog.totalProducts}`);
    console.log(`  Categories: ${catalog.categories.join(', ')}`);
    console.log(`  Collections: ${catalog.collections.join(', ')}`);

    const bestsellers = products.filter(p => p.isBestseller).length;
    const newItems = products.filter(p => p.isNew).length;
    const limited = products.filter(p => p.isLimitedEdition).length;

    console.log(`\n🏷️  Badges:`);
    console.log(`  Bestsellers: ${bestsellers}`);
    console.log(`  New Items: ${newItems}`);
    console.log(`  Limited Edition: ${limited}`);

    console.log('\n✅ Seeding complete!\n');
  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll();
}

export { seedAll };
