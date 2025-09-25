const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Get cart items for authenticated user
router.get('/', cartController.getCart);

// Get cart item count
router.get('/count', cartController.getCartCount);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update cart item quantity
router.put('/:itemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/:itemId', cartController.removeFromCart);

// Clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;