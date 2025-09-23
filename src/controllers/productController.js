const Product = require('../models/Product');
const Category = require('../models/Category');
const { validateProduct, validateProductUpdate } = require('../utils/validation');

const productController = {
  async getAllProducts(req, res) {
    try {
      const {
        category_id,
        active,
        featured,
        limit = 50,
        page = 1,
        sort_by = 'name',
        sort_order = 'asc'
      } = req.query;

      const isActive = active !== undefined ? active === 'true' : true;
      const isFeatured = featured !== undefined ? featured === 'true' : undefined;
      const pageLimit = Math.min(parseInt(limit) || 50, 100);
      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const offset = (pageNumber - 1) * pageLimit;

      const products = await Product.findAll({
        categoryId: category_id ? parseInt(category_id) : undefined,
        isActive,
        isFeatured,
        limit: pageLimit,
        offset,
        sortBy: sort_by,
        sortOrder: sort_order
      });

      const totalCount = await Product.getProductCount({
        categoryId: category_id ? parseInt(category_id) : undefined,
        isActive
      });

      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: products,
        pagination: {
          page: pageNumber,
          limit: pageLimit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageLimit)
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const product = await Product.findById(parseInt(id));

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { active, limit = 50, page = 1 } = req.query;

      if (!categoryId || isNaN(parseInt(categoryId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid category ID is required'
        });
      }

      const category = await Category.findById(parseInt(categoryId));
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const isActive = active !== undefined ? active === 'true' : true;
      const pageLimit = Math.min(parseInt(limit) || 50, 100);
      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const offset = (pageNumber - 1) * pageLimit;

      const products = await Product.findByCategory(parseInt(categoryId), {
        isActive,
        limit: pageLimit,
        offset
      });

      const totalCount = await Product.getProductCount({
        categoryId: parseInt(categoryId),
        isActive
      });

      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: products,
        category: category,
        pagination: {
          page: pageNumber,
          limit: pageLimit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / pageLimit)
        }
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getFeaturedProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const pageLimit = Math.min(parseInt(limit) || 10, 50);

      const products = await Product.findFeatured({ limit: pageLimit });

      res.json({
        success: true,
        message: 'Featured products retrieved successfully',
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async searchProducts(req, res) {
    try {
      const { q, category_id, limit = 50, page = 1 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const pageLimit = Math.min(parseInt(limit) || 50, 100);
      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const offset = (pageNumber - 1) * pageLimit;

      const products = await Product.search(q.trim(), {
        categoryId: category_id ? parseInt(category_id) : undefined,
        limit: pageLimit,
        offset
      });

      res.json({
        success: true,
        message: 'Search completed successfully',
        data: products,
        searchTerm: q.trim(),
        pagination: {
          page: pageNumber,
          limit: pageLimit,
          total: products.length
        }
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async createProduct(req, res) {
    try {
      const { error, value } = validateProduct(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }

      const category = await Category.findById(value.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }

      const product = await Product.create(value);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);

      if (error.message.includes('duplicate key') && error.message.includes('sku')) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const { error, value } = validateProductUpdate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }

      const existingProduct = await Product.findById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (value.category_id) {
        const category = await Category.findById(value.category_id);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
      }

      const updatedProduct = await Product.update(parseInt(id), value);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);

      if (error.message.includes('duplicate key') && error.message.includes('sku')) {
        return res.status(409).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateProductStock(req, res) {
    try {
      const { id } = req.params;
      const { stock_quantity } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      if (stock_quantity === undefined || isNaN(parseInt(stock_quantity)) || parseInt(stock_quantity) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid stock quantity is required'
        });
      }

      const existingProduct = await Product.findById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updatedProduct = await Product.updateStock(parseInt(id), parseInt(stock_quantity));

      res.json({
        success: true,
        message: 'Product stock updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Update product stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const existingProduct = await Product.findById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async deactivateProduct(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const existingProduct = await Product.findById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const deactivatedProduct = await Product.deactivate(parseInt(id));

      res.json({
        success: true,
        message: 'Product deactivated successfully',
        data: deactivatedProduct
      });
    } catch (error) {
      console.error('Deactivate product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = productController;