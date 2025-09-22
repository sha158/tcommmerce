const express = require('express');
const { config, validateConfig } = require('./src/config/config');
const { connectDB } = require('./src/config/database');
const { setupSecurity, rateLimiter } = require('./src/middleware/security');
const { globalErrorHandler, notFoundHandler } = require('./src/utils/errorHandler');
const routes = require('./src/routes');

const app = express();

const startServer = async () => {
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

    const server = app.listen(config.port, () => {
      console.log(`
🚀 TCommerce API Server Started Successfully!
🌍 Environment: ${config.nodeEnv}
🔗 Server URL: http://localhost:${config.port}
📚 API Documentation: http://localhost:${config.port}/api/v1/health
📡 Health Check: http://localhost:${config.port}/api/v1/health

Available Endpoints:
• POST /api/v1/auth/register - User registration
• POST /api/v1/auth/login - User login
• GET /api/v1/auth/profile - Get user profile (requires auth)

Ready to accept requests! 🎉
      `);
    });

    const gracefulShutdown = () => {
      console.log('\n🔄 Received shutdown signal. Gracefully shutting down...');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;