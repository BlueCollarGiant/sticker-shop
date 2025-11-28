/**
 * Product Router
 * Route definitions with dependency injection
 */

import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { DemoProductStore } from '../../infra/demo/demo-product.store';

// Singleton instance for shared state
let productService: ProductService;
let productController: ProductController;

export function createProductRouter(): Router {
  const router = Router();

  // Initialize dependencies (singleton pattern)
  if (!productService) {
    const productStore = new DemoProductStore();
    productService = new ProductService(productStore);
    productController = new ProductController(productService);
  }

  // Product routes
  router.get('/', productController.getAllProducts);
  router.get('/catalog', productController.getCatalog);
  router.get('/:id', productController.getProductById);
  router.post('/', productController.createProduct);
  router.put('/:id', productController.updateProduct);
  router.delete('/:id', productController.deleteProduct);
  router.patch('/:id/stock', productController.updateStock);
  router.patch('/:id/badge', productController.toggleBadge);

  return router;
}

// Export service instance for startup seeding
export function getProductService(): ProductService {
  if (!productService) {
    const productStore = new DemoProductStore();
    productService = new ProductService(productStore);
  }
  return productService;
}
