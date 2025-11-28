const express = require('express');
const router = express.Router();

// Demo order storage (in-memory for now)
let orders = [];
let orderIdCounter = 1;

router.post('/create', async (req, res) => {
  try {
    const orderData = req.body;

    // Create demo order
    const order = {
      id: `order-${orderIdCounter++}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    res.json({
      success: true,
      data: order,
      message: 'Order created successfully (demo mode)',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

module.exports = router;
