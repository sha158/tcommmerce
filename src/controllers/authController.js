const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { AppError } = require('../utils/errorHandler');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.validatedBody;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('User with this email already exists', 409));
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || null
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          email: newUser.email,
          phone: newUser.phone,
          createdAt: newUser.created_at
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await User.findByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.is_active) {
      return next(new AppError('Account has been deactivated', 401));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    await User.updateLastLogin(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          lastLogin: new Date().toISOString()
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};