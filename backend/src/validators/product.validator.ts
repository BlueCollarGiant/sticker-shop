import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    price: z.number().positive(),
    salePrice: z.number().positive().optional(),
    category: z.string(),
    collection: z.string(),
    stock: z.number().int().nonnegative(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
  }),
});

export const updateStockSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    stock: z.number().int().nonnegative(),
  }),
});
