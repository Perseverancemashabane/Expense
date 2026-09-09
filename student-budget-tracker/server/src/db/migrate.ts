import { db, testConnection, isUsingPostgres } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

export async function runMigration() {
  console.log('🔄 Running database migration...');
  const connStatus = await testConnection();
  console.log(`📡 Database mode: ${connStatus.mode}`);

  if (isUsingPostgres) {
    const pool = db.getPool();
    if (!pool) throw new Error('Database pool not available');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Budgets Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          month VARCHAR(7) UNIQUE NOT NULL, -- Format: YYYY-MM
          amount NUMERIC(12, 2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 2. Categories Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          icon VARCHAR(50) NOT NULL,
          color VARCHAR(20) NOT NULL,
          allocated_budget NUMERIC(12, 2) DEFAULT 0.00
        );
      `);

      // 3. Expenses Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS expenses (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          category_name VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          notes TEXT,
          payment_method VARCHAR(50) DEFAULT 'Cash',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 4. Performance Indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_name);
        CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets (month);
      `);

      await client.query('COMMIT');
      console.log('✅ PostgreSQL migrations completed successfully!');
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('❌ Migration error:', err.message);
      throw err;
    } finally {
      client.release();
    }
  } else {
    console.log('ℹ️ Running in resilient local storage mode. Default tables and structure initialized.');
  }
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

