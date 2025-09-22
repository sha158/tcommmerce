const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { config } = require('../config/config');

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const runSupabaseMigrations = async () => {
  try {
    console.log('🔄 Starting Supabase migrations...');

    const createUsersTableSQL = `
      -- Create Users Table
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

      -- Add email validation constraint
      ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger for updated_at
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: createUsersTableSQL });

    if (error) {
      if (error.message.includes('function exec_sql')) {
        console.log('📝 exec_sql function not available, trying direct table creation...');

        const { data: tableData, error: tableError } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (tableError && tableError.message.includes('relation "users" does not exist')) {
          console.log('❌ Users table needs to be created manually in Supabase dashboard');
          console.log('Please go to your Supabase dashboard → SQL Editor and run this SQL:');
          console.log('\n' + createUsersTableSQL + '\n');
          return;
        } else {
          console.log('✅ Users table already exists or is accessible');
        }
      } else {
        throw error;
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Please manually create the users table in Supabase:');
    console.log('1. Go to https://supabase.com/dashboard/project/ocisoipvhywzukmjnwtf/editor');
    console.log('2. Click "New Query"');
    console.log('3. Paste and run the SQL from the migration file');
  }
};

if (require.main === module) {
  runSupabaseMigrations();
}

module.exports = { runSupabaseMigrations };