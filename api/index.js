const express = require('express');
const { config, validateConfig } = require('../src/config/config');
const { connectDB } = require('../src/config/database');
const { setupSecurity, rateLimiter } = require('../src/middleware/security');
const { globalErrorHandler, notFoundHandler } = require('../src/utils/errorHandler');
const routes = require('../src/routes');

const app = express();

// Initialize app configuration
const initializeApp = async () => {
  try {
    validateConfig();
    console.log('✅ Environment configuration validated');

    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection');
    }

    setupSecurity(app);

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use(rateLimiter(15 * 60 * 1000, 1000));

    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
      next();
    });

    app.use('/api/v1', routes);

    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to TCommerce API',
        version: '1.0.0',
        documentation: '/api/v1/health',
        endpoints: {
          health: 'GET /api/v1/health',
          register: 'POST /api/v1/auth/register',
          login: 'POST /api/v1/auth/login',
          profile: 'GET /api/v1/auth/profile'
        }
      });
    });

    app.use('*', notFoundHandler);
    app.use(globalErrorHandler);

  } catch (error) {
    console.error('❌ Failed to initialize app:', error.message);
  }
};

// Initialize the app
initializeApp();

module.exports = app;