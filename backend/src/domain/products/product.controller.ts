/**
 * Product Controller
 * HTTP request/response handling for products
 */

import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { CreateProductInput, UpdateProductInput } from './product.types';

export class ProductController {
  constructor(private productService: ProductService) {}

  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.productService.getAllProducts();
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: CreateProductInput = req.body;
      const product = await this.productService.createProduct(input);
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateProductInput = req.body;
      const product = await this.productService.updateProduct(id, input);
      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.productService.deleteProduct(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const product = await this.productService.updateProductStock(id, stock);
      res.json({
        success: true,
        data: product,
        message: 'Stock updated successfully',
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  toggleBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { badge } = req.body;
      const product = await this.productService.toggleProductBadge(id, badge);
      res.json({
        success: true,
        data: product,
        message: 'Badge toggled successfully',
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  getCatalog = async (req: Request, res: Response): Promise<void> => {
    try {
      const catalog = await this.productService.getCatalog();
      res.json({
        success: true,
        data: catalog,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch catalog',
        error: error.message,
      });
    }
  };
}
