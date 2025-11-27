const express = require('express');
const router = express.Router();
const printifyService = require('../services/printify');
const { DemoProductStore } = require('../dist/infra/demo/demo-product.store');

// Use environment variable instead of deleted config file
const DEMO_MODE = process.env.DEMO_MODE === 'true' || true;

// Initialize demo product store
const demoProductStore = new DemoProductStore();

// Get the appropriate service based on demo mode
const getProductService = () => {
  return DEMO_MODE ? demoProductStore : printifyService;
};

router.get('/', async (req, res) => {
  try {
    const service = getProductService();
    // DemoProductStore.getAll() now returns Promise
    const products = await service.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

router.get('/catalog', async (req, res) => {
  try {
    const service = getProductService();
    // DemoProductStore.getCatalog() now returns Promise
    const catalog = await service.getCatalog();
    res.json(catalog);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch catalog',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = getProductService();
    // DemoProductStore.getById() now returns Promise
    const product = await service.getById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

module.exports = router;
