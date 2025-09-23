const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TCommerce API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        profile: 'GET /api/v1/auth/profile'
      },
      categories: {
        list: 'GET /api/v1/categories',
        get: 'GET /api/v1/categories/:id',
        create: 'POST /api/v1/categories',
        update: 'PUT /api/v1/categories/:id',
        delete: 'DELETE /api/v1/categories/:id'
      },
      products: {
        list: 'GET /api/v1/products',
        get: 'GET /api/v1/products/:id',
        featured: 'GET /api/v1/products/featured',
        search: 'GET /api/v1/products/search?q=',
        byCategory: 'GET /api/v1/products/category/:categoryId',
        create: 'POST /api/v1/products',
        update: 'PUT /api/v1/products/:id',
        delete: 'DELETE /api/v1/products/:id'
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

module.exports = router;