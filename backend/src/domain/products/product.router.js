const { Router } = require('express');
const { ProductController } = require('./product.controller');
const { ProductService } = require('./product.service');
const fileProductRepository = require('../../infra/file/file-product.repository');

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
  router.post('/', productController.createProduct);
  router.put('/:id', productController.updateProduct);
  router.delete('/:id', productController.deleteProduct);
  router.patch('/:id/stock', productController.updateStock);
  router.patch('/:id/badge', productController.toggleBadge);

  return router;
}

function getProductService() {
  return getProductServiceInstance();
}

module.exports = {
  createProductRouter,
  getProductService,
};
