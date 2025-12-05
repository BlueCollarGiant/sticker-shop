const { Router } = require('express');
const { CartController } = require('./cart.controller.js');
const { CartService } = require('./cart.service.js');
const { FileCartRepository } = require('../../infra/file/file-cart.repository.js');
const { validate } = require('../../middleware/validate.js');
const { addToCartSchema, updateCartItemSchema } = require('../../validators/cart.validator.js');

function createCartRouter() {
  const router = Router();

  const cartRepository = new FileCartRepository();
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
