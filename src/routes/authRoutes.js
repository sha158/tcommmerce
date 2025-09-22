const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRequest, userRegistrationSchema, userLoginSchema } = require('../utils/validation');
const { rateLimiter } = require('../middleware/security');

const router = express.Router();

router.post('/register',
  rateLimiter(15 * 60 * 1000, 5),
  validateRequest(userRegistrationSchema),
  register
);

router.post('/login',
  rateLimiter(15 * 60 * 1000, 10),
  validateRequest(userLoginSchema),
  login
);

router.get('/profile',
  authenticate,
  getProfile
);

module.exports = router;