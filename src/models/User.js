const { supabase } = require('../config/database');

class User {
  static async create({ firstName, lastName, email, password, phone }) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          phone: phone
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async updateLastLogin(id) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  static async updateProfile(id, updates) {
    const allowedFields = ['first_name', 'last_name', 'phone'];
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
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, first_name, last_name, email, phone, updated_at')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async deactivate(id) {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, is_active')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

module.exports = User;// Force reload
