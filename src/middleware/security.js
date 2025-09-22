const helmet = require('helmet');
const cors = require('cors');
const { config } = require('../config/config');

const setupSecurity = (app) => {
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma'
    ]
  };

  app.use(cors(corsOptions));

  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'TCommerce API');
    res.setHeader('X-API-Version', '1.0.0');
    next();
  });
};

const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const clientData = requests.get(ip);

    if (now > clientData.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    clientData.count++;
    next();
  };
};

module.exports = {
  setupSecurity,
  rateLimiter
};