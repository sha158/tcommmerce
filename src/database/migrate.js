const fs = require('fs');
const path = require('path');
const { query, connectDB } = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');

    await connectDB();

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    for (const file of migrationFiles) {
      console.log(`📄 Running migration: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await query(sql);
      console.log(`✅ Migration completed: ${file}`);
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };