import { z } from 'zod';

/**
 * Cart validation schemas
 */

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    quantity: z.number().int().positive('Quantity must be positive'),
    price: z.number().nonnegative('Price cannot be negative'),
    title: z.string().min(1, 'Title is required').max(200),
    imageUrl: z.string().url('Invalid image URL'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  }),
});
