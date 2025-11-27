import { Router } from 'express';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { DemoCartStore } from '../../infra/demo/demo-cart.store';
import { validate } from '../../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../../validators/cart.validator';

/**
 * Cart Router - Route definitions
 *
 * Dependency injection setup:
 * Repository (DemoCartStore) → Service → Controller → Router
 */
export function createCartRouter(): Router {
  const router = Router();

  // Wire up dependencies (Dependency Injection)
  const cartRepository = new DemoCartStore();
  const cartService = new CartService(cartRepository);
  const cartController = new CartController(cartService);

  // Routes
  router.get('/', cartController.getCart);
  router.post('/add', validate(addToCartSchema), cartController.addItem);
  router.put('/update/:id', validate(updateCartItemSchema), cartController.updateItem);
  router.delete('/remove/:id', cartController.removeItem);
  router.delete('/clear', cartController.clearCart);

  return router;
}
