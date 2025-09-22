const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const { config } = require('./config');

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Server will start but database operations will fail');
    console.log('🔧 Please check your DATABASE_URL in .env file');
    return false;
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  pool,
  connectDB,
  query
};