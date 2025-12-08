# Roadmap

## Overview

Feature plans, technical debt, and future improvements for the Sticker Shop project.

## Completed ✅

### Phase 1: Core Features (December 2025)
- ✅ User authentication (JWT)
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ Order management
- ✅ Admin panel (products, orders, users)
- ✅ Signal-based search engine
- ✅ Angular 20 migration

## In Progress 🔄

### Phase 2: Polish & Optimization
- 🔄 Comprehensive documentation
- 🔄 Test coverage improvements
- 🔄 Performance optimization
- 🔄 Mobile responsiveness fixes

## Planned 📋

### Phase 3: Enhanced Features (Q1 2026)
- 📋 Payment integration (Stripe)
- 📋 Email notifications
- 📋 Order tracking with status updates
- 📋 Product reviews and ratings
- 📋 Wishlist functionality
- 📋 Advanced search filters

### Phase 4: Infrastructure (Q2 2026)
- 📋 Database implementation (PostgreSQL/MongoDB)
- 📋 Redis caching layer
- 📋 File upload system (product images)
- 📋 CDN integration
- 📋 Comprehensive logging
- 📋 Error monitoring (Sentry)

### Phase 5: User Experience (Q2-Q3 2026)
- 📋 Dark mode theme
- 📋 Accessibility improvements (WCAG AA)
- 📋 Progressive Web App (PWA)
- 📋 Offline support
- 📋 i18n (internationalization)

### Phase 6: Analytics & Admin Tools (Q3 2026)
- 📋 Sales analytics dashboard
- 📋 Inventory management
- 📋 Customer insights
- 📋 Marketing tools (coupons, promotions)
- 📋 Bulk operations

## Technical Debt 🔧

### High Priority
- Refactor admin components from `/components` to `/features`
- Implement proper database layer
- Add comprehensive error handling
- Set up CI/CD pipeline
- Add E2E tests

### Medium Priority
- Implement API versioning
- Add request validation middleware
- Optimize bundle sizes
- Improve TypeScript strict mode compliance
- Set up Docker containers

### Low Priority
- Migrate from bcrypt to argon2
- Implement WebSocket for real-time updates
- Add GraphQL alternative to REST
- Implement micro-frontends architecture

## Feature Requests 💡

Track user feature requests here:

1. **Social login** (Google, Facebook) - Requested: Dec 2025
2. **Guest checkout** - Requested: Dec 2025
3. **Product comparison** - Requested: Dec 2025
4. **Gift cards** - Requested: Dec 2025

## Performance Goals 🎯

- Initial load time: < 3s
- Time to interactive: < 5s
- Lighthouse score: > 90
- API response time: < 200ms (p95)
- Bundle size: < 500KB (gzipped)

## Security Roadmap 🔒

- Implement CSRF protection
- Add rate limiting per endpoint
- Set up automated security scanning
- Implement API key rotation
- Add comprehensive input sanitization
- Set up security headers
- Implement content security policy (CSP)

## Migration Plans 🚀

### Angular Updates
- Stay current with Angular releases
- Migrate to signals fully (remove remaining RxJS where possible)

### Database Migration
```
Phase 1: Set up database
Phase 2: Implement ORM/ODM
Phase 3: Create migrations
Phase 4: Migrate in-memory data
Phase 5: Remove in-memory storage
```

## Deprecation Notices ⚠️

- NgModules (use standalone components)
- Class-based guards (use functional guards)
- Two-way binding with `[(ngModel)]` (prefer signals)

## Related Documentation

- [Frontend Architecture](../frontend/architecture.md)
- [Backend Architecture](../backend/architecture.md)
- [Conventions](./conventions.md)

---

**Last Updated:** December 2025
**Next Review:** January 2026
