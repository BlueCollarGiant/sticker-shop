const { createApp } = require('./app.js');
const { env } = require('./config/env.js');
const { seedAll } = require('./seeds/seed-all.js');

async function startServer() {
  try {
    await seedAll();
  } catch (error) {
    console.error('Seeding failed on startup:', error);
    process.exit(1);
  }

  const app = await createApp();
  const PORT = env.PORT;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Night Reader Shop - Backend running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}

startServer();
