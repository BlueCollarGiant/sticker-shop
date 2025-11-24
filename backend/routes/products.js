const express = require('express');
const router = express.Router();
const printifyService = require('../services/printify');
const mockDataService = require('../services/mock-data.service');
const { DEMO_MODE } = require('../config/demo-mode');

// Get the appropriate service based on demo mode
const getProductService = () => {
  return DEMO_MODE ? mockDataService : printifyService;
};

router.get('/', async (req, res) => {
  try {
    const service = getProductService();

    if (DEMO_MODE) {
      // Mock service returns data synchronously
      const products = service.getAll();
      res.json(products);
    } else {
      // Printify service returns promise
      const products = await service.getProducts();
      res.json(products);
    }
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

    if (DEMO_MODE) {
      const catalog = service.getCatalog();
      res.json(catalog);
    } else {
      const catalog = await service.getCatalog();
      res.json(catalog);
    }
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

    if (DEMO_MODE) {
      const product = service.getById(req.params.id);
      res.json(product);
    } else {
      const product = await service.getProduct(req.params.id);
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

module.exports = router;
