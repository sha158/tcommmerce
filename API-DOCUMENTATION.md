# TCommerce API Documentation

## Overview
The TCommerce API provides endpoints for managing categories and products in an e-commerce application. The API includes full CRUD operations with authentication for admin operations.

## Database Setup
Before using the API, you need to run the database migration:

```sql
-- Run the create-ecommerce-tables.sql file in your PostgreSQL database
psql -d your_database -f create-ecommerce-tables.sql
```

This will create:
- **categories** table with 10 common grocery categories
- **products** table with 24 sample products across all categories
- Proper indexes for performance
- Sample data ready for testing

## API Endpoints

### Categories API

#### GET /api/v1/categories
Get all categories (public endpoint)
- Query params: `?active=true|false` (default: true)
- Returns: Array of categories

#### GET /api/v1/categories/:id
Get a specific category by ID (public endpoint)
- Returns: Category object

#### POST /api/v1/categories
Create a new category (requires authentication)
- Body: `{ name, description?, imageUrl?, isActive? }`
- Returns: Created category

#### PUT /api/v1/categories/:id
Update a category (requires authentication)
- Body: `{ name?, description?, image_url?, is_active? }`
- Returns: Updated category

#### DELETE /api/v1/categories/:id
Delete a category (requires authentication)
- Returns: Success message

#### PATCH /api/v1/categories/:id/deactivate
Deactivate a category (requires authentication)
- Returns: Deactivated category

### Products API

#### GET /api/v1/products
Get all products (public endpoint)
- Query params:
  - `category_id`: Filter by category
  - `active=true|false` (default: true)
  - `featured=true|false`: Filter featured products
  - `limit`: Number of products per page (max 100, default 50)
  - `page`: Page number (default 1)
  - `sort_by`: Sort field (name, price, created_at, etc.)
  - `sort_order`: asc|desc (default asc)
- Returns: Array of products with pagination info

#### GET /api/v1/products/featured
Get featured products (public endpoint)
- Query params: `limit` (max 50, default 10)
- Returns: Array of featured products

#### GET /api/v1/products/search
Search products (public endpoint)
- Query params:
  - `q`: Search term (minimum 2 characters)
  - `category_id`: Filter by category
  - `limit`, `page`: Pagination
- Returns: Array of matching products

#### GET /api/v1/products/category/:categoryId
Get products by category (public endpoint)
- Query params: `active`, `limit`, `page`
- Returns: Array of products in the category

#### GET /api/v1/products/:id
Get a specific product by ID (public endpoint)
- Returns: Product object with category info

#### POST /api/v1/products
Create a new product (requires authentication)
- Body: `{ name, description?, price, originalPrice?, categoryId, sku?, stockQuantity?, imageUrl?, images?, isActive?, isFeatured?, weight?, unit?, brand? }`
- Returns: Created product

#### PUT /api/v1/products/:id
Update a product (requires authentication)
- Body: Product fields to update
- Returns: Updated product

#### PATCH /api/v1/products/:id/stock
Update product stock (requires authentication)
- Body: `{ stock_quantity }`
- Returns: Updated stock info

#### DELETE /api/v1/products/:id
Delete a product (requires authentication)
- Returns: Success message

#### PATCH /api/v1/products/:id/deactivate
Deactivate a product (requires authentication)
- Returns: Deactivated product

## Sample Data

The database comes pre-populated with:

### Categories (10):
1. Fruits & Vegetables
2. Dairy & Eggs
3. Meat & Seafood
4. Bakery
5. Pantry Staples
6. Beverages
7. Snacks
8. Frozen Foods
9. Personal Care
10. Household Items

### Products (24):
Each category has 2-3 sample products with realistic data including:
- Names, descriptions, prices
- Stock quantities
- Images (via Unsplash)
- Some products marked as featured
- Proper categorization

## Authentication

Admin operations (POST, PUT, DELETE, PATCH) require authentication:
- Header: `Authorization: Bearer <token>`
- Get token via `/api/v1/auth/login` endpoint

## Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed validation errors..."]
}
```

## Success Responses

All endpoints return consistent success format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { /* Response data */ },
  "pagination": { /* For paginated responses */ }
}
```

## Testing

Use the health endpoint to verify API is running:
```
GET /api/v1/health
```

This returns all available endpoints and system status.