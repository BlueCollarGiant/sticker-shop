# Authentication System

## Overview

JWT-based authentication system for user registration, login, and protected routes.

## JWT Token Structure

```javascript
{
  userId: "user_123",
  email: "user@example.com",
  role: "user", // or "admin"
  iat: 1234567890,
  exp: 1234567890
}
```

## Password Security

- Hashed with **bcrypt** (10 salt rounds)
- Never stored in plain text
- Never sent in responses

## Implementation

TODO: Add complete implementation details

---

**Last Updated:** December 2025
