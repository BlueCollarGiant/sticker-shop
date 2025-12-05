const { createApp } = require('./app.js');
const { env } = require('./config/env.js');

async function startServer() {
  const app = await createApp();
  const PORT = env.PORT;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Night Reader Shop - Backend running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}

startServer();
