const Cart = require('../models/Cart');
const { asyncHandler } = require('../utils/errorHandler');

const cartController = {
  addToCart: asyncHandler(async (req, res) => {
    const { product_id, productId, quantity = 1 } = req.body;
    const finalProductId = product_id || productId;
    const userId = req.user.id;

    if (!finalProductId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    try {
      const cartItem = await Cart.addItem(userId, finalProductId, quantity);

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: cartItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }),

  getCart: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const cart = await Cart.getCartItems(userId);

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    });
  }),

  updateCartItem: asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    try {
      const updatedItem = await Cart.updateItemQuantity(userId, itemId, quantity);

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: updatedItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }),

  removeFromCart: asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id;

    try {
      await Cart.removeItem(userId, itemId);

      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }),

  clearCart: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await Cart.clearCart(userId);

    res.json({
      success: true,
      message: result.message,
      data: {
        items_removed: result.deleted_count
      }
    });
  }),

  getCartCount: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const count = await Cart.getCartItemCount(userId);

    res.json({
      success: true,
      message: 'Cart count retrieved successfully',
      data: {
        total_items: count
      }
    });
  })
};

module.exports = cartController;