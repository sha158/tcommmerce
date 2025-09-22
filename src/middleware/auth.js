const { verifyToken } = require('../utils/auth');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return next(new AppError('Invalid or expired token', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    if (!user.is_active) {
      return next(new AppError('Account has been deactivated', 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };

    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        };
      }
    } catch (error) {
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};