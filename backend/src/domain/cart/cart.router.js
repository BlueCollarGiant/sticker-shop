const { Router } = require('express');
const { CartController } = require('./cart.controller');
const { CartService } = require('./cart.service');
const { DemoCartStore } = require('../../infra/demo/demo-cart.store');
const { validate } = require('../../middleware/validate');
const { addToCartSchema, updateCartItemSchema } = require('../../validators/cart.validator');

function createCartRouter() {
  const router = Router();

  const cartRepository = new DemoCartStore();
  const cartService = new CartService(cartRepository);
  const cartController = new CartController(cartService);

  router.get('/', cartController.getCart);
  router.post('/add', validate(addToCartSchema), cartController.addItem);
  router.put('/update/:id', validate(updateCartItemSchema), cartController.updateItem);
  router.delete('/remove/:id', cartController.removeItem);
  router.delete('/clear', cartController.clearCart);

  return router;
}

module.exports = { createCartRouter };
