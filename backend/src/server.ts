import { createApp } from './app';
import { env } from './config/env';
import { DemoProductStore } from './infra/demo/demo-product.store';
import { DemoAuthStore } from './infra/demo/demo-auth.store';
import { seedAll } from './seeds/seed-all';

async function startServer() {
  // Auto-seed on startup if needed (only in demo mode)
  if (env.DEMO_MODE) {
    const productStore = new DemoProductStore();
    const authStore = new DemoAuthStore();

    const productsEmpty = await productStore.isEmpty();
    const usersEmpty = await authStore.isEmpty();

    if (productsEmpty || usersEmpty) {
      console.log('[SEED] Database empty, auto-seeding...');
      await seedAll();
    } else {
      const userCount = await authStore.getUserCount();
      const catalog = await productStore.getCatalog();
      console.log(`[SEED] Loaded ${userCount} users, ${catalog.totalProducts} products`);
    }
  }

  const app = await createApp();
  const PORT = env.PORT;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Night Reader Shop - Backend running on port ${PORT}`);
    console.log(`📍 Mode: ${env.DEMO_MODE ? 'DEMO' : 'PRODUCTION'}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health\n`);
  });
}

startServer();
