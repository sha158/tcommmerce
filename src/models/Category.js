const { supabase } = require('../config/database');

class Category {
  static async create({ name, description, imageUrl, isActive = true }) {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: name,
          description: description,
          image_url: imageUrl,
          is_active: isActive
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findAll({ isActive = true } = {}) {
    let query = supabase
      .from('categories')
      .select('*')
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

  static async findById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'description', 'image_url', 'is_active'];
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
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('categories')
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
      .from('categories')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

module.exports = Category;