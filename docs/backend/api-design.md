# API Design

## Overview

RESTful API conventions and endpoint documentation for the Sticker Shop backend.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.stickershop.com/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## Endpoints

### Authentication

**POST /auth/signup**
- Create new user account
- Body: `{ email, password, name }`
- Response: `{ user, token }`

**POST /auth/login**
- Authenticate user
- Body: `{ email, password }`
- Response: `{ user, token }`

**GET /auth/profile** 🔒
- Get current user profile
- Headers: Authorization token
- Response: `{ user }`

### Products

**GET /products**
- Get all products
- Query: `?category=stickers&search=hello`
- Response: `{ data: [products] }`

**GET /products/:id**
- Get product by ID
- Response: `{ data: product }`

**POST /products** 🔒 (Admin only)
- Create new product
- Body: Product object
- Response: `{ data: product }`

**PUT /products/:id** 🔒 (Admin only)
- Update product
- Body: Partial product object
- Response: `{ data: product }`

**DELETE /products/:id** 🔒 (Admin only)
- Delete product
- Response: `{ success: true }`

### Orders

**GET /orders** 🔒
- Get user's orders
- Response: `{ data: [orders] }`

**POST /orders** 🔒
- Create new order
- Body: `{ items: [{ productId, quantity }], total }`
- Response: `{ data: order }`

**GET /orders/:id** 🔒
- Get order by ID
- Response: `{ data: order }`

### Admin

**GET /admin/users** 🔒 (Admin only)
- Get all users
- Response: `{ data: [users] }`

**GET /admin/users/:id/orders** 🔒 (Admin only)
- Get user's orders
- Response: `{ data: [orders] }`

**GET /admin/orders** 🔒 (Admin only)
- Get all orders
- Query: `?status=pending`
- Response: `{ data: [orders] }`

## HTTP Status Codes

- **200 OK** - Successful GET, PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Missing/invalid token
- **403 Forbidden** - Not enough permissions
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

## Pagination

TODO: Implement pagination for list endpoints

```
GET /products?page=1&limit=20
```

## Filtering & Sorting

TODO: Implement advanced filtering

```
GET /products?category=stickers&sortBy=price&order=asc
```

---

**Last Updated:** December 2025
