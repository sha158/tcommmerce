const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', categoryController.getAllCategories);

router.get('/:id', categoryController.getCategoryById);

router.post('/', authenticate, categoryController.createCategory);

router.put('/:id', authenticate, categoryController.updateCategory);

router.delete('/:id', authenticate, categoryController.deleteCategory);

router.patch('/:id/deactivate', authenticate, categoryController.deactivateCategory);

module.exports = router;