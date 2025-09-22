const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TCommerce API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

router.use('/auth', authRoutes);

module.exports = router;