const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productTitle: z.string().min(1, 'Product title is required'),
  productImage: z.string().optional(),
  variantId: z.string().optional(),
  variantDetails: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().nonnegative('Price cannot be negative'),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    total: z.number().positive('Order total must be greater than zero'),
    // Only creation-time statuses are valid on POST — transition states are managed via PATCH /:id/status
    status: z.enum(['pending', 'paid']).optional(),
    paymentIntentId: z.string().min(1, 'paymentIntentId cannot be empty').optional(),
    shippingAddress: shippingAddressSchema,
  }),
});

module.exports = { createOrderSchema };
