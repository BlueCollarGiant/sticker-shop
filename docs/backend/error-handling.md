# Error Handling

## Overview

Centralized error handling patterns for the backend API.

## Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}
```

## Error Middleware

```javascript
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}
```

## Usage

```javascript
if (!user) {
  throw new NotFoundError('User');
}

if (!isValid) {
  throw new ValidationError('Invalid email format');
}
```

---

**Last Updated:** December 2025
