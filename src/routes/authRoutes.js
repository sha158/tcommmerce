const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRequest, userRegistrationSchema, userLoginSchema } = require('../utils/validation');

const router = express.Router();

router.post('/register',
  validateRequest(userRegistrationSchema),
  register
);

router.post('/login',
  validateRequest(userLoginSchema),
  login
);

router.get('/profile',
  authenticate,
  getProfile
);

module.exports = router;