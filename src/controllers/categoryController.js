const Category = require('../models/Category');
const { validateCategory, validateCategoryUpdate } = require('../utils/validation');

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const { active } = req.query;
      const isActive = active !== undefined ? active === 'true' : true;

      const categories = await Category.findAll({ isActive });

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid category ID is required'
        });
      }

      const category = await Category.findById(parseInt(id));

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async createCategory(req, res) {
    try {
      const { error, value } = validateCategory(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }

      const category = await Category.create(value);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);

      if (error.message.includes('duplicate key')) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid category ID is required'
        });
      }

      const { error, value } = validateCategoryUpdate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }

      const existingCategory = await Category.findById(parseInt(id));
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const updatedCategory = await Category.update(parseInt(id), value);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);

      if (error.message.includes('duplicate key')) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid category ID is required'
        });
      }

      const existingCategory = await Category.findById(parseInt(id));
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await Category.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async deactivateCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid category ID is required'
        });
      }

      const existingCategory = await Category.findById(parseInt(id));
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const deactivatedCategory = await Category.deactivate(parseInt(id));

      res.json({
        success: true,
        message: 'Category deactivated successfully',
        data: deactivatedCategory
      });
    } catch (error) {
      console.error('Deactivate category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = categoryController;