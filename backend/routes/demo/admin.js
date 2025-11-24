const express = require('express');
const router = express.Router();
const mockDataService = require('../../services/mock-data.service');
const authenticate = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireAdmin());

// GET /api/demo/admin/products - List all products
router.get('/products', (req, res) => {
  try {
    const products = mockDataService.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// POST /api/demo/admin/products - Create new product
router.post('/products', (req, res) => {
  try {
    const newProduct = mockDataService.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// PUT /api/demo/admin/products/:id - Update product
router.put('/products/:id', (req, res) => {
  try {
    const updatedProduct = mockDataService.update(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
});

// DELETE /api/demo/admin/products/:id - Delete product
router.delete('/products/:id', (req, res) => {
  try {
    const result = mockDataService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

// PATCH /api/demo/admin/products/:id/stock - Update stock
router.patch('/products/:id/stock', (req, res) => {
  try {
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        error: 'Invalid stock value',
        message: 'Stock must be a non-negative number'
      });
    }

    const updatedProduct = mockDataService.updateStock(req.params.id, stock);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({
      error: 'Failed to update stock',
      message: error.message
    });
  }
});

// PATCH /api/demo/admin/products/:id/badges - Toggle badge
router.patch('/products/:id/badges', (req, res) => {
  try {
    const { badge } = req.body;

    if (!badge) {
      return res.status(400).json({
        error: 'Badge required',
        message: 'Badge type must be provided (new, bestseller, limited, sale)'
      });
    }

    const validBadges = ['new', 'bestseller', 'limited', 'sale'];
    if (!validBadges.includes(badge)) {
      return res.status(400).json({
        error: 'Invalid badge',
        message: `Badge must be one of: ${validBadges.join(', ')}`
      });
    }

    const updatedProduct = mockDataService.toggleBadge(req.params.id, badge);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({
      error: 'Failed to toggle badge',
      message: error.message
    });
  }
});

module.exports = router;
