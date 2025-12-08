# Services

## Overview

Business logic layer patterns and service implementations.

## Service Pattern

```javascript
// services/product.service.js
export class ProductService {
  async getAllProducts(filters = {}) {
    // Business logic
    return products;
  }

  async getProductById(id) {
    const product = await findProduct(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async createProduct(data) {
    // Validation
    // Business rules
    // Data access
    return createdProduct;
  }
}
```

## Service Responsibilities

- Input validation
- Business rule enforcement
- Data transformation
- Error handling
- Transaction management

TODO: Document all service implementations

---

**Last Updated:** December 2025
