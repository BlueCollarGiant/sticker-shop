const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

if (!process.env.PRINTIFY_API_KEY) {
  console.warn('WARNING: PRINTIFY_API_KEY is not set. Printify API calls will fail.');
  console.warn('Please set PRINTIFY_API_KEY in your .env file or environment variables.');
}

if (!process.env.PRINTIFY_SHOP_ID) {
  console.warn('WARNING: PRINTIFY_SHOP_ID is not set. Printify API calls will fail.');
  console.warn('Please set PRINTIFY_SHOP_ID in your .env file or environment variables.');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Printify Stickers Backend API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
