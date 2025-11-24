const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { DEMO_MODE, PRINTIFY_ENABLED } = require('./config/demo-mode');

// Check for required environment variables based on mode
if (PRINTIFY_ENABLED) {
  if (!process.env.PRINTIFY_API_KEY) {
    console.warn('WARNING: PRINTIFY_API_KEY is not set. Printify API calls will fail.');
    console.warn('Please set PRINTIFY_API_KEY in your .env file or environment variables.');
  }

  if (!process.env.PRINTIFY_SHOP_ID) {
    console.warn('WARNING: PRINTIFY_SHOP_ID is not set. Printify API calls will fail.');
    console.warn('Please set PRINTIFY_SHOP_ID in your .env file or environment variables.');
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/demo/admin');

// Apply routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

// Demo admin routes (only available in demo mode)
if (DEMO_MODE) {
  app.use('/api/demo/admin', adminRouter);
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Night Reader Shop Backend API is running',
    mode: DEMO_MODE ? 'DEMO' : 'PRODUCTION',
    demoModeEnabled: DEMO_MODE
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Mode: ${DEMO_MODE ? 'DEMO' : 'PRODUCTION'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);

  if (DEMO_MODE) {
    console.log('\n🎭 DEMO MODE ENABLED');
    console.log('  - Using mock data from data/demo-products.json');
    console.log('  - Admin panel available at /api/demo/admin');
    console.log('  - Demo accounts:');
    console.log('    User: demo@nightreader.com / demo123');
    console.log('    Admin: admin@nightreader.com / admin123\n');
  }
});
