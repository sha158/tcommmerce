const { supabase } = require('../config/database');

class Product {
  static async create({
    name,
    description,
    price,
    originalPrice,
    categoryId,
    sku,
    stockQuantity = 0,
    imageUrl,
    images = [],
    isActive = true,
    isFeatured = false,
    weight,
    unit,
    brand
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: name,
          description: description,
          price: price,
          original_price: originalPrice,
          category_id: categoryId,
          sku: sku,
          stock_quantity: stockQuantity,
          image_url: imageUrl,
          images: images,
          is_active: isActive,
          is_featured: isFeatured,
          weight: weight,
          unit: unit,
          brand: brand
        }
      ])
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findAll({
    categoryId,
    isActive = true,
    isFeatured,
    limit = 50,
    offset = 0,
    sortBy = 'name',
    sortOrder = 'asc'
  } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .range(offset, offset + limit - 1);

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured);
    }

    const validSortFields = ['name', 'price', 'created_at', 'updated_at', 'stock_quantity'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findByCategory(categoryId, { isActive = true, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .eq('category_id', categoryId)
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findFeatured({ limit = 10 } = {}) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async search(searchTerm, { categoryId, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async update(id, updates) {
    const allowedFields = [
      'name', 'description', 'price', 'original_price', 'category_id',
      'sku', 'stock_quantity', 'image_url', 'images', 'is_active',
      'is_featured', 'weight', 'unit', 'brand'
    ];
    const updateData = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async updateStock(id, stockQuantity) {
    const { data, error } = await supabase
      .from('products')
      .update({
        stock_quantity: stockQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, stock_quantity')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async deactivate(id) {
    const { data, error } = await supabase
      .from('products')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, description, image_url)
      `)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async getProductCount({ categoryId, isActive = true } = {}) {
    let query = supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return count;
  }
}

module.exports = Product;