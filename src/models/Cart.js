const { pool } = require('../config/database');

class Cart {
  static async addItem(userId, productId, quantity = 1) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if product exists and has sufficient stock
      const productResult = await client.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error('Product not found or inactive');
      }

      const product = productResult.rows[0];
      if (product.stock_quantity < quantity) {
        throw new Error('Insufficient stock available');
      }

      // Check if item already exists in cart
      const existingItem = await client.query(
        'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );

      let result;
      if (existingItem.rows.length > 0) {
        // Update existing item
        const newQuantity = existingItem.rows[0].quantity + quantity;
        if (newQuantity > product.stock_quantity) {
          throw new Error('Total quantity exceeds available stock');
        }

        result = await client.query(
          `UPDATE cart_items
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2 AND product_id = $3
           RETURNING *`,
          [newQuantity, userId, productId]
        );
      } else {
        // Add new item
        result = await client.query(
          `INSERT INTO cart_items (user_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, productId, quantity, product.price]
        );
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getCartItems(userId) {
    const result = await pool.query(
      `SELECT
        ci.*,
        p.name as product_name,
        p.price as current_price,
        p.image_url,
        p.stock_quantity,
        (ci.quantity * ci.price) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.is_active = true
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      summary: {
        total_items: totalItems,
        total_amount: total.toFixed(2)
      }
    };
  }

  static async updateItemQuantity(userId, productId, quantity) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validate quantity
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Check product stock
      const productResult = await client.query(
        'SELECT stock_quantity FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error('Product not found or inactive');
      }

      if (productResult.rows[0].stock_quantity < quantity) {
        throw new Error('Insufficient stock available');
      }

      // Update cart item
      const result = await client.query(
        `UPDATE cart_items
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2 AND product_id = $3
         RETURNING *`,
        [quantity, userId, productId]
      );

      if (result.rows.length === 0) {
        throw new Error('Cart item not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async removeItem(userId, productId) {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );

    if (result.rows.length === 0) {
      throw new Error('Cart item not found');
    }

    return result.rows[0];
  }

  static async clearCart(userId) {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 RETURNING COUNT(*) as deleted_count',
      [userId]
    );

    return {
      deleted_count: parseInt(result.rows[0].deleted_count),
      message: 'Cart cleared successfully'
    };
  }

  static async getCartItemCount(userId) {
    const result = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total_items FROM cart_items WHERE user_id = $1',
      [userId]
    );

    return parseInt(result.rows[0].total_items);
  }
}

module.exports = Cart;