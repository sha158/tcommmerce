const Joi = require('joi');

const userRegistrationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),

  phone: Joi.string()
    .pattern(new RegExp('^[+]?[1-9]\\d{1,14}$'))
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const categorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters',
      'any.required': 'Category name is required'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),

  isActive: Joi.boolean()
    .optional()
    .default(true)
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 100 characters'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  image_url: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),

  is_active: Joi.boolean()
    .optional()
});

const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 200 characters',
      'any.required': 'Product name is required'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),

  originalPrice: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'Original price must be a positive number'
    }),

  categoryId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive',
      'any.required': 'Category ID is required'
    }),

  sku: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'SKU cannot exceed 50 characters'
    }),

  stockQuantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.integer': 'Stock quantity must be an integer',
      'number.min': 'Stock quantity cannot be negative'
    }),

  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .optional()
    .messages({
      'array.base': 'Images must be an array of URLs'
    }),

  isActive: Joi.boolean()
    .optional()
    .default(true),

  isFeatured: Joi.boolean()
    .optional()
    .default(false),

  weight: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.positive': 'Weight must be a positive number'
    }),

  unit: Joi.string()
    .trim()
    .max(20)
    .optional()
    .messages({
      'string.max': 'Unit cannot exceed 20 characters'
    }),

  brand: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Brand cannot exceed 100 characters'
    })
});

const productUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 200 characters'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'Price must be a positive number'
    }),

  original_price: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .allow(null)
    .messages({
      'number.positive': 'Original price must be a positive number'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be positive'
    }),

  sku: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'SKU cannot exceed 50 characters'
    }),

  stock_quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'Stock quantity must be an integer',
      'number.min': 'Stock quantity cannot be negative'
    }),

  image_url: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .optional()
    .messages({
      'array.base': 'Images must be an array of URLs'
    }),

  is_active: Joi.boolean()
    .optional(),

  is_featured: Joi.boolean()
    .optional(),

  weight: Joi.number()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.positive': 'Weight must be a positive number'
    }),

  unit: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Unit cannot exceed 20 characters'
    }),

  brand: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Brand cannot exceed 100 characters'
    })
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    req.validatedBody = value;
    next();
  };
};

const validateCategory = (data) => {
  return categorySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

const validateCategoryUpdate = (data) => {
  return categoryUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

const validateProduct = (data) => {
  return productSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

const validateProductUpdate = (data) => {
  return productUpdateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  categorySchema,
  categoryUpdateSchema,
  productSchema,
  productUpdateSchema,
  validateRequest,
  validateCategory,
  validateCategoryUpdate,
  validateProduct,
  validateProductUpdate,
};