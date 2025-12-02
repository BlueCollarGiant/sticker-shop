/**
 * Product Router
 * Route definitions with dependency injection
 */

import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { DemoProductStore } from '../../infra/demo/demo-product.store';
import { IProductRepository } from './product.types';

// Singleton instances for shared state
let productRepository: IProductRepository;
let productService: ProductService;
let productController: ProductController;

/**
 * Initialize product repository based on mode
 */
function getProductRepository(): IProductRepository {
  if (!productRepository) {
    productRepository = new DemoProductStore();
  }
  return productRepository;
}

/**
 * Get product service singleton
 */
function getProductServiceInstance(): ProductService {
  if (!productService) {
    productService = new ProductService(getProductRepository());
  }
  return productService;
}

export function createProductRouter(): Router {
  const router = Router();

  // Initialize dependencies (demo store singleton pattern)
  if (!productController) {
    productService = getProductServiceInstance();
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
  return getProductServiceInstance();
}
