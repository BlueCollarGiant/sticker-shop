# Printify Stickers E-Commerce

A modern e-commerce platform for selling custom print-on-demand stickers powered by Printify's API.

## Tech Stack

### Frontend
- **Angular 20** - Modern web framework with zoneless architecture
- **TypeScript** - Type-safe JavaScript
- **Standalone Components** - No NgModules required

### Backend
- **Node.js** with **Express** - REST API server
- **Printify API** - Print-on-demand service integration
- **In-memory storage** - Cart management (MVP)

## Project Structure

```
.
├── frontend/          # Angular 20 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components
│   │   │   ├── services/      # API services
│   │   │   └── app.routes.ts  # Routing configuration
│   │   └── main.ts
│   ├── angular.json           # Angular CLI configuration
│   └── package.json
│
├── backend/           # Express API server
│   ├── routes/        # API route handlers
│   ├── services/      # Printify service integration
│   ├── server.js      # Entry point
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- Printify account with API access
- API token from Printify dashboard

### Setup

1. **Configure Printify API**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your Printify API credentials
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3000
   ```

5. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   # App runs on http://localhost:5000
   ```

## API Endpoints

### Products
- `GET /api/products` - Get all products from Printify
- `GET /api/products/:id` - Get single product details
- `GET /api/products/catalog` - Get Printify catalog

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `PUT /api/cart/update/:id` - Update cart item quantity
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details

## Printify Integration

This project uses the Printify REST API v1 for:
- Product catalog browsing
- Product management
- Order creation and fulfillment
- Shop management

### Required Environment Variables

```env
PRINTIFY_API_KEY=your_api_token_here
PRINTIFY_SHOP_ID=your_shop_id_here
PORT=3000
```

### Getting Your Printify Credentials

1. Log in to your Printify account
2. Navigate to **Connections** section
3. Generate a new API token
4. Note your Shop ID from the dashboard

## Features

### Current (MVP)
- ✅ Monorepo structure with frontend and backend
- ✅ Angular 20 with routing and HTTP client
- ✅ Express backend with RESTful API
- ✅ Printify API integration
- ✅ Product listing and details
- ✅ Shopping cart functionality
- ✅ Checkout flow UI

### Next Phase
- 🔄 Persistent database (PostgreSQL)
- 🔄 User authentication
- 🔄 Payment processing (Stripe/PayPal)
- 🔄 Order tracking and webhooks
- 🔄 Admin dashboard
- 🔄 Product search and filters
- 🔄 Responsive design enhancements

## Development

### Angular Dev Server Configuration
The Angular development server is configured for Replit:
- Port: 5000
- Host: 0.0.0.0
- Allowed hosts: all
- Proxy: API requests to backend on port 3000

### Code Generation
```bash
# Generate new component
cd frontend
npx ng generate component components/my-component --skip-tests

# Generate new service
npx ng generate service services/my-service --skip-tests
```

## Deployment

This project is configured for deployment on Replit. The Angular frontend runs on port 5000 and proxies API requests to the Express backend on port 3000.

## GitHub Integration

This project can be pushed to GitHub using the Replit GitHub integration for version control and collaboration.

## License

MIT

## Support

For Printify API questions, visit [Printify Developer Docs](https://developers.printify.com/)
