const express = require('express');
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get('/featured', productController.getFeaturedProducts);

router.get('/search', productController.searchProducts);

router.get('/category/:categoryId', productController.getProductsByCategory);

router.get('/:id', productController.getProductById);

router.post('/', authenticate, productController.createProduct);

router.put('/:id', authenticate, productController.updateProduct);

router.patch('/:id/stock', authenticate, productController.updateProductStock);

router.delete('/:id', authenticate, productController.deleteProduct);

router.patch('/:id/deactivate', authenticate, productController.deactivateProduct);

module.exports = router;