# Data Models

## Overview

Database schemas and data structures for the application.

## User Model

```javascript
{
  id: string,
  email: string (unique),
  password: string (hashed),
  name: string,
  role: "user" | "admin",
  createdAt: Date
}
```

## Product Model

```javascript
{
  id: string,
  title: string,
  description: string,
  price: number,
  category: string,
  images: string[],
  stock: number,
  isNew: boolean,
  isBestseller: boolean,
  createdAt: Date
}
```

## Order Model

```javascript
{
  id: string,
  userId: string,
  items: [{
    productId: string,
    quantity: number,
    price: number
  }],
  total: number,
  status: "pending" | "processing" | "shipped" | "delivered",
  createdAt: Date
}
```

TODO: Add complete schemas with validation rules

---

**Last Updated:** December 2025
