# Backend Architecture

## Overview

The Sticker Shop backend is built with **Node.js and Express**, providing a RESTful API for the Angular frontend. This document outlines the server architecture, design patterns, and key architectural decisions.

The backend handles authentication, product management, order processing, and admin operations while maintaining security, scalability, and maintainability.

## Core Principles

### 1. Layered Architecture
The backend follows a three-layer architecture:

```
Controller Layer → Service Layer → Data Access Layer
```

**Controller Layer**: HTTP request/response handling
**Service Layer**: Business logic and validation
**Data Access Layer**: Database queries and models

### 2. Separation of Concerns
Each module has a single responsibility:
- **Routes** - Define endpoints
- **Controllers** - Handle requests
- **Services** - Business logic
- **Models** - Data schemas
- **Middleware** - Cross-cutting concerns

### 3. Security First
- JWT authentication
- Password hashing (bcrypt)
- Input validation and sanitization
- CORS configuration
- Rate limiting
- SQL injection prevention

## Directory Structure

```
backend/
│
├── src/
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── orders.routes.js
│   │   └── admin.routes.js
│   │
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   ├── products.controller.js
│   │   ├── orders.controller.js
│   │   └── admin.controller.js
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.js
│   │   ├── products.service.js
│   │   └── orders.service.js
│   │
│   ├── models/              # Data models/schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── config/              # Configuration
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── cors.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── password.js
│   │   └── tokens.js
│   │
│   └── server.js            # Application entry point
│
├── tests/                   # Test files
├── .env                     # Environment variables
└── package.json
```

TODO: Reorganize to match modern Express best practices

## Request Flow

```
1. HTTP Request
     ↓
2. CORS Middleware
     ↓
3. Rate Limiting
     ↓
4. Body Parsing (express.json())
     ↓
5. Route Matching
     ↓
6. Authentication Middleware (if protected)
     ↓
7. Validation Middleware
     ↓
8. Controller Method
     ↓
9. Service Layer (Business Logic)
     ↓
10. Data Access Layer (Database)
     ↓
11. Response or Error
```

## Authentication Flow

### Registration
```
1. POST /api/auth/signup
2. Validate input (email, password, name)
3. Check if user exists
4. Hash password (bcrypt)
5. Create user in database
6. Generate JWT token
7. Return { user, token }
```

### Login
```
1. POST /api/auth/login
2. Validate credentials
3. Find user by email
4. Compare password hash
5. Generate JWT token
6. Return { user, token }
```

### Protected Routes
```
1. Request with Authorization header
2. Extract JWT token
3. Verify token signature
4. Decode user payload
5. Attach user to request
6. Proceed to controller
```

See [Auth System](./auth-system.md) for detailed implementation.

## Database Strategy

TODO: Document database choice (PostgreSQL, MongoDB, etc.)

### Current Approach
The application currently uses **in-memory storage** for development/demo purposes.

### Future Migration
```javascript
// Current (in-memory)
const users = [];
users.push(newUser);

// Future (database)
await User.create(newUser);
```

TODO: Implement database layer with Prisma/TypeORM/Mongoose

## Error Handling

### Error Middleware

```javascript
// middleware/error.middleware.js
export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
```

### Custom Error Classes

```javascript
// utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}
```

See [Error Handling](./error-handling.md) for complete patterns.

## Middleware Stack

### Global Middleware (Applied to All Routes)

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

### Route-Specific Middleware

```javascript
// Protected routes
router.get('/profile', authMiddleware, getProfile);

// Admin-only routes
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Validation middleware
router.post('/products',
  validateProduct,
  createProduct
);
```

## API Versioning

TODO: Implement API versioning strategy

```javascript
// Planned structure
app.use('/api/v1/products', productsRoutes);
app.use('/api/v2/products', productsV2Routes);
```

## Environment Configuration

```bash
# .env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/stickershop

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:4200

# Email (future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Performance Considerations

### Caching Strategy
TODO: Implement Redis caching for:
- Product listings
- User sessions
- Frequently accessed data

### Database Optimization
TODO: Implement:
- Connection pooling
- Query optimization
- Indexing strategy
- Pagination

### Response Compression

```javascript
import compression from 'compression';

app.use(compression());
```

## Deployment

### Development
```bash
npm run dev    # Run with nodemon (auto-reload)
```

### Production
```bash
npm run build  # Compile TypeScript (if used)
npm start      # Run production server
```

TODO: Document:
- Docker containerization
- CI/CD pipeline
- Environment-specific configs
- Health check endpoints

## Monitoring & Logging

TODO: Implement:
- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Request logging

```javascript
// Planned logging structure
logger.info('User logged in', { userId, email });
logger.error('Database connection failed', { error });
logger.warn('Rate limit exceeded', { ip, endpoint });
```

## Security Measures

### Implemented
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation

### TODO
- ⏳ Rate limiting per endpoint
- ⏳ SQL injection prevention (parameterized queries)
- ⏳ XSS protection
- ⏳ CSRF tokens
- ⏳ API key rotation
- ⏳ Request size limits
- ⏳ File upload security

## Architecture Decisions

### ADR-001: Express Framework
**Decision:** Use Express.js for the backend framework

**Rationale:**
- Industry standard for Node.js
- Minimal and unopinionated
- Large ecosystem
- Easy to learn

**Consequences:**
- Need to set up structure ourselves
- More flexibility, more decisions

### ADR-002: JWT Authentication
**Decision:** Use JWT tokens for authentication

**Rationale:**
- Stateless (no server-side sessions)
- Works well with single-page apps
- Easy to implement

**Consequences:**
- Cannot invalidate tokens before expiry
- Tokens can grow large with payload

TODO: Add more architecture decisions

## Testing Strategy

TODO: Implement comprehensive testing

**Planned:**
- Unit tests (Jest, Mocha)
- Integration tests (Supertest)
- E2E tests
- Load testing

## API Documentation

TODO: Generate API documentation with:
- Swagger/OpenAPI
- Postman collections
- Auto-generated docs from JSDoc

## Related Documentation

- [API Design](./api-design.md) - RESTful API conventions
- [Auth System](./auth-system.md) - Authentication details
- [Data Models](./data-models.md) - Database schemas
- [Services](./services.md) - Business logic patterns
- [Error Handling](./error-handling.md) - Error patterns

---

**Last Updated:** December 2025
