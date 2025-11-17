const express = require('express');
const router = express.Router();
const printifyService = require('../services/printify');

router.post('/create', async (req, res) => {
  try {
    const orderData = req.body;
    const order = await printifyService.createOrder(orderData);
    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create order', 
      message: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await printifyService.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      message: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await printifyService.getOrder(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch order', 
      message: error.message 
    });
  }
});

module.exports = router;
