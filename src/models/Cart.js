const { supabase } = require('../config/database');

class Cart {
  static async addItem(userId, productId, quantity = 1) {
    // Check if product exists and has sufficient stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      throw new Error('Product not found or inactive');
    }

    if (product.stock_quantity < quantity) {
      throw new Error('Insufficient stock available');
    }

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        throw new Error('Total quantity exceeds available stock');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
          price: product.price
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      return data;
    }
  }

  static async getCartItems(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          name,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', userId)
      .eq('products.is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const items = data.map(item => ({
      ...item,
      product_name: item.products.name,
      current_price: item.products.price,
      image_url: item.products.image_url,
      stock_quantity: item.products.stock_quantity,
      subtotal: (item.quantity * item.price)
    }));
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
    // Validate quantity
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Check product stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      throw new Error('Product not found or inactive');
    }

    if (product.stock_quantity < quantity) {
      throw new Error('Insufficient stock available');
    }

    // Update cart item
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Cart item not found');
    }

    return data;
  }

  static async removeItem(userId, productId) {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Cart item not found');
    }

    return data;
  }

  static async clearCart(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      deleted_count: data ? data.length : 0,
      message: 'Cart cleared successfully'
    };
  }

  static async getCartItemCount(userId) {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
    return totalItems;
  }
}

module.exports = Cart;