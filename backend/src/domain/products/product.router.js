const { Router } = require('express');
const { ProductController } = require('./product.controller.js');
const { ProductService } = require('./product.service.js');
const fileProductRepository = require('../../infra/file/file-product.repository.js');
const { authenticate } = require('../../middleware/auth.middleware.js');
const { requireAdmin } = require('../../middleware/role.middleware.js');

let productService;
let productController;

function getProductServiceInstance() {
  if (!productService) {
    productService = new ProductService(fileProductRepository);
  }
  return productService;
}

function createProductRouter() {
  const router = Router();

  if (!productController) {
    productService = getProductServiceInstance();
    productController = new ProductController(productService);
  }

  router.get('/', productController.getAllProducts);
  router.get('/catalog', productController.getCatalog);
  router.get('/:id', productController.getProductById);
  router.post('/', authenticate, requireAdmin, productController.createProduct);
  router.put('/:id', authenticate, requireAdmin, productController.updateProduct);
  router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);
  router.patch('/:id/stock', authenticate, requireAdmin, productController.updateStock);
  router.patch('/:id/badge', authenticate, requireAdmin, productController.toggleBadge);

  return router;
}

function getProductService() {
  return getProductServiceInstance();
}

module.exports = {
  createProductRouter,
  getProductService,
};
