const express = require('express');
const router = express.Router();
const printifyService = require('../services/printify');

router.get('/', async (req, res) => {
  try {
    const products = await printifyService.getProducts();
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
    const catalog = await printifyService.getCatalog();
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
    const product = await printifyService.getProduct(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch product', 
      message: error.message 
    });
  }
});

module.exports = router;
