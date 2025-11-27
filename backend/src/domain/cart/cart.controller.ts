import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service';

/**
 * Cart Controller - HTTP layer for cart operations
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response
 * - Dependency Inversion: Depends on CartService, not repository
 *
 * Responsibilities:
 * - Extract data from request
 * - Call service methods
 * - Format response
 * - Handle errors (delegates to error middleware)
 */
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * GET /api/cart
   * Get user's cart with totals
   */
  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || 'guest';

      const cart = await this.cartService.getCart(userId);
      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/cart/add
   * Add item to cart
   */
  addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || 'guest';
      const { productId, variantId, quantity, price, title, imageUrl } = req.body;

      const cart = await this.cartService.addItem({
        userId,
        productId,
        variantId,
        quantity,
        price,
        title,
        imageUrl,
      });

      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        message: 'Item added to cart',
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/cart/update/:id
   * Update item quantity
   */
  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || 'guest';
      const itemId = req.params.id;
      const { quantity } = req.body;

      const cart = await this.cartService.updateItem({
        userId,
        itemId,
        quantity,
      });

      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        message: 'Cart updated',
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/cart/remove/:id
   * Remove item from cart
   */
  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || 'guest';
      const itemId = req.params.id;

      const cart = await this.cartService.removeItem({
        userId,
        itemId,
      });

      const totals = this.cartService.calculateTotals(cart);

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
          cart,
          totals,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/cart/clear
   * Clear entire cart
   */
  clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || 'guest';

      await this.cartService.clearCart(userId);

      res.json({
        success: true,
        message: 'Cart cleared',
        data: {
          cart: {
            userId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          totals: {
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            itemCount: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
