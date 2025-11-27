import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Mode: ${env.DEMO_MODE ? 'DEMO' : 'PRODUCTION'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);

  if (env.DEMO_MODE) {
    console.log('🎭 DEMO MODE ENABLED');
    console.log('  - Using mock data from data/demo-products.json');
    console.log('  - Admin panel available at /api/demo/admin');
    console.log('  - Demo accounts:');
    console.log('    User: demo@nightreader.com / demo123');
    console.log('    Admin: admin@nightreader.com / admin123\n');
  }
});
