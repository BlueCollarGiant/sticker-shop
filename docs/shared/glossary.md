# Glossary

## Overview

Common terms and definitions used throughout the Sticker Shop codebase.

## Frontend Terms

**Signal**
- Angular's reactive primitive for state management
- Replaces BehaviorSubject for synchronous state
- Example: `const count = signal(0)`

**Computed**
- Derived state that automatically updates when dependencies change
- Example: `const total = computed(() => price() * quantity())`

**Effect**
- Side effect that runs when signals change
- Example: `effect(() => console.log(count()))`

**Standalone Component**
- Angular component that doesn't require NgModule
- Declares imports directly in component metadata

**Store**
- Injectable class that manages global state using signals
- Example: `CartStore`, `AuthStore`

**Guard**
- Function that controls route access
- Example: `authGuard`, `adminGuard`

**Resolver**
- Function that pre-fetches data before route activation

**Lazy Loading**
- Loading modules/components only when needed
- Reduces initial bundle size

## Backend Terms

**JWT (JSON Web Token)**
- Stateless authentication token
- Contains user information and expiration

**Middleware**
- Function that processes requests before controllers
- Example: authentication, validation, logging

**Controller**
- Handles HTTP requests and responses
- Delegates business logic to services

**Service**
- Contains business logic and data access
- Reusable across controllers

**Model**
- Defines data structure and validation rules
- Represents database entity

**bcrypt**
- Password hashing algorithm
- Used for secure password storage

**CORS (Cross-Origin Resource Sharing)**
- Allows frontend to make API requests from different origin

**Rate Limiting**
- Restricts number of requests per time window
- Prevents abuse

## General Terms

**REST (Representational State Transfer)**
- Architectural style for web APIs
- Uses HTTP methods (GET, POST, PUT, DELETE)

**CRUD**
- Create, Read, Update, Delete operations

**DTO (Data Transfer Object)**
- Object that carries data between processes
- Often used for API request/response

**API Endpoint**
- Specific URL path for API operations
- Example: `/api/products/:id`

**Schema**
- Structure definition for data
- Defines fields, types, and validation

**Migration**
- Script to change database structure
- Tracks schema changes over time

**Seed Data**
- Initial data loaded into database
- Used for testing and development

**Environment Variable**
- Configuration value stored outside code
- Example: `DATABASE_URL`, `JWT_SECRET`

**Dependency Injection**
- Pattern where dependencies are provided to classes
- Angular uses `inject()` function

**TypeScript**
- Typed superset of JavaScript
- Provides static type checking

**Observable (RxJS)**
- Lazy push-based data stream
- Used for asynchronous operations

**Promise**
- Represents eventual completion of async operation
- Alternative to callbacks

**Async/Await**
- Syntactic sugar for working with Promises
- Makes async code look synchronous

## Domain-Specific Terms

**Product**
- Item available for purchase (sticker, print, etc.)

**Cart**
- Temporary collection of products before checkout

**Order**
- Confirmed purchase with payment
- Contains products, quantities, and total

**User**
- Person with an account
- Can be customer or admin

**Admin**
- User with elevated permissions
- Can manage products, orders, and users

**Category**
- Product classification
- Example: "Stickers", "Prints", "Bundles"

**Badge**
- Visual indicator on product
- Example: "New", "Sale", "Limited Edition"

**Stock**
- Available quantity of a product

**SKU (Stock Keeping Unit)**
- Unique identifier for product variants

## Acronyms

- **SPA** - Single Page Application
- **SSR** - Server-Side Rendering
- **CSR** - Client-Side Rendering
- **API** - Application Programming Interface
- **HTTP** - Hypertext Transfer Protocol
- **HTTPS** - HTTP Secure
- **URL** - Uniform Resource Locator
- **JSON** - JavaScript Object Notation
- **XML** - Extensible Markup Language
- **CSS** - Cascading Style Sheets
- **HTML** - HyperText Markup Language
- **DOM** - Document Object Model
- **MVC** - Model-View-Controller
- **ORM** - Object-Relational Mapping
- **SQL** - Structured Query Language
- **NoSQL** - Non-relational database

## Related Documentation

- [Conventions](./conventions.md) - Naming and code conventions
- [Frontend Architecture](../frontend/architecture.md)
- [Backend Architecture](../backend/architecture.md)

---

**Last Updated:** December 2025
