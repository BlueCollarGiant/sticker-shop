const express = require('express');
const router = express.Router();

let cart = [];

router.get('/', (req, res) => {
  res.json(cart);
});

router.post('/add', (req, res) => {
  const { productId, variantId, quantity, price, title, imageUrl } = req.body;
  
  const existingItem = cart.find(
    item => item.productId === productId && item.variantId === variantId
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: Date.now(),
      productId,
      variantId,
      quantity,
      price,
      title,
      imageUrl
    });
  }
  
  res.json({ message: 'Item added to cart', cart });
});

router.delete('/remove/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  cart = cart.filter(item => item.id !== itemId);
  res.json({ message: 'Item removed from cart', cart });
});

router.put('/update/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const { quantity } = req.body;
  
  const item = cart.find(item => item.id === itemId);
  if (item) {
    item.quantity = quantity;
    res.json({ message: 'Cart updated', cart });
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

router.delete('/clear', (req, res) => {
  cart = [];
  res.json({ message: 'Cart cleared', cart });
});

module.exports = router;
