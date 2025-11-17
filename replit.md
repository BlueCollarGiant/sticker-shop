# Printify Stickers E-Commerce - Project Documentation

## Overview
This is a monorepo e-commerce application for selling custom stickers through Printify's print-on-demand API. Built with Angular 20 for the frontend and Express for the backend.

## Project Status
**Status**: Skeleton Complete (MVP Phase)  
**Last Updated**: November 17, 2025

## Architecture

### Monorepo Structure
The project uses a monorepo pattern with two main directories:
- `frontend/` - Angular 20 application
- `backend/` - Express.js REST API

### Technology Stack
- **Frontend**: Angular 20 (zoneless), TypeScript, Standalone Components
- **Backend**: Node.js 22, Express, Axios
- **Integration**: Printify REST API v1
- **Dev Server**: Angular CLI Dev Server (port 5000)

## Recent Changes

### November 17, 2025 - Initial Skeleton Setup
- Created monorepo structure with frontend/ and backend/ folders
- Installed Node.js 22 and Angular CLI
- Generated Angular 20 project with routing
- Set up Express backend with API routes
- Created Printify service integration
- Configured Angular dev server for Replit (port 5000, allowedHosts)
- Set up proxy configuration for backend API
- Created basic components: Home, Products, ProductDetail, Cart, Checkout
- Implemented routing and navigation
- Added HttpClient provider
- Configured workflow for Angular dev server on port 5000

## User Preferences

### Development Style
- Monorepo structure preferred
- Separate frontend/backend folders
- Best effort fallback stack (Angular instead of React)
- Skeleton-first approach to save time

### Workflow
- Plans to push to GitHub repository
- Using Replit for rapid development
- Wants complete project skeleton before customization

## Project Configuration

### Angular Configuration
The Angular project is configured specifically for Replit:
```json
{
  "serve": {
    "options": {
      "port": 5000,
      "host": "0.0.0.0",
      "allowedHosts": ["all"],
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

### Workflow Setup
- **Name**: Angular Frontend
- **Command**: `cd frontend && npm start`
- **Port**: 5000
- **Type**: webview

### Environment Variables Required
```
PRINTIFY_API_KEY=your_printify_api_token
PRINTIFY_SHOP_ID=your_shop_id
PORT=3000
```

## API Structure

### Backend Routes
1. **Products** (`/api/products`)
   - GET `/` - List all products
   - GET `/:id` - Get product details
   - GET `/catalog` - Get Printify catalog

2. **Cart** (`/api/cart`)
   - GET `/` - Get cart
   - POST `/add` - Add to cart
   - DELETE `/remove/:id` - Remove item
   - PUT `/update/:id` - Update quantity
   - DELETE `/clear` - Clear cart

3. **Orders** (`/api/orders`)
   - POST `/create` - Create order
   - GET `/` - List orders
   - GET `/:id` - Get order details

### Frontend Services
- `ProductsService` - Handles product API calls
- `CartService` - Manages cart state and API calls

### Frontend Components
- `Home` - Landing page
- `Products` - Product listing
- `ProductDetail` - Individual product view
- `Cart` - Shopping cart
- `Checkout` - Order checkout

## Integration Details

### Printify API
The backend uses Printify's REST API for:
- Product management
- Order creation and fulfillment
- Catalog browsing
- Shop management

**API Base URL**: https://api.printify.com/v1  
**Authentication**: Bearer token

## Next Steps

### Immediate Tasks
1. Set up Printify API credentials (.env configuration)
2. Test product fetching from Printify
3. Implement product listing UI
4. Add product detail views
5. Complete cart functionality
6. Test checkout flow

### Future Enhancements
1. Database Integration
   - Replace in-memory cart with PostgreSQL
   - Add user accounts and order history
   
2. Authentication
   - User registration and login
   - Protected routes
   
3. Payment Processing
   - Stripe or PayPal integration
   - Order confirmation emails
   
4. Advanced Features
   - Product search and filtering
   - Admin dashboard
   - Order tracking with Printify webhooks
   - Responsive design improvements

## Important Notes

### Replit-Specific Configuration
- Angular MUST run on port 5000 for webview
- AllowedHosts set to "all" for iframe compatibility
- Proxy configuration routes /api to backend on port 3000
- Analytics disabled to prevent interactive prompts

### MongoDB Note
MongoDB is not available on Replit. The project uses in-memory storage for cart in the MVP phase. Future phases will use PostgreSQL for persistence.

### GitHub Integration
The GitHub connection is set up and ready for pushing code to a repository.

## Development Workflow

1. Start backend: `cd backend && npm start`
2. Start frontend: Workflow "Angular Frontend" auto-starts on port 5000
3. Access app: Via Replit webview on port 5000
4. API endpoints: Proxied through Angular dev server

## Troubleshooting

### If frontend doesn't load
1. Check workflow is running
2. Verify Angular dev server logs
3. Ensure port 5000 is configured
4. Check allowedHosts configuration

### If API calls fail
1. Verify backend is running on port 3000
2. Check proxy.conf.json configuration
3. Verify Printify API credentials in .env
4. Check CORS settings in Express

## Dependencies

### Frontend
- @angular/core, @angular/router, @angular/common
- @angular/cli
- TypeScript
- RxJS

### Backend
- express
- cors
- axios
- dotenv
- body-parser

## Files Structure
```
frontend/
  src/
    app/
      components/
        home/
        products/
        product-detail/
        cart/
        checkout/
      services/
        products.ts
        cart.ts
      app.ts
      app.routes.ts
      app.config.ts
  angular.json
  proxy.conf.json
  package.json

backend/
  routes/
    products.js
    cart.js
    orders.js
  services/
    printify.js
  server.js
  .env.example
  package.json
```
