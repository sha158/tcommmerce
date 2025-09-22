const { supabase } = require('./src/config/database');

const createUsersTable = async () => {
  try {
    console.log('🔄 Creating users table...');

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error && error.message.includes('relation "users" does not exist')) {
      console.log('❌ Users table does not exist. Please create it manually in Supabase dashboard.');
      console.log('\n📝 Go to: https://supabase.com/dashboard/project/ocisoipvhywzukmjnwtf/editor');
      console.log('Click "New Query" and run this SQL:\n');

      const sql = `
CREATE TABLE users (
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
      `;

      console.log(sql);
      return;
    }

    if (error) {
      console.error('❌ Error checking table:', error.message);
      return;
    }

    console.log('✅ Users table exists and is accessible!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

createUsersTable();