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

      // 1. Students Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          student_number VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          phone_number VARCHAR(50),
          password_pin VARCHAR(255),
          monthly_allowance NUMERIC(12, 2) DEFAULT 3500.00,
          reset_token VARCHAR(255),
          reset_token_expires TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Ensure reset columns and phone_number exist if table was already created
      await client.query(`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
      `);

      // Seed Default Student (Naledi Mashabane)
      await client.query(`
        INSERT INTO students (name, student_number, email, phone_number, password_pin, monthly_allowance)
        VALUES ('Naledi Perseverance Mashabane', '230099774', '230099774@tut4life.ac.za', '0710000000', '1234', 3500.00)
        ON CONFLICT (student_number) DO UPDATE SET phone_number = COALESCE(students.phone_number, '0710000000');
      `);

      // 2. Budgets Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          student_number VARCHAR(50) DEFAULT '230099774',
          month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
          amount NUMERIC(12, 2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Add student_number column to existing budgets table if missing
      await client.query(`
        ALTER TABLE budgets ADD COLUMN IF NOT EXISTS student_number VARCHAR(50) DEFAULT '230099774';
        UPDATE budgets SET student_number = '230099774' WHERE student_number IS NULL;
      `);

      // Drop legacy single-month unique constraint and add composite (student_number, month) constraint
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_month_key') THEN
            ALTER TABLE budgets DROP CONSTRAINT budgets_month_key;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budgets_student_month_key') THEN
            ALTER TABLE budgets ADD CONSTRAINT budgets_student_month_key UNIQUE (student_number, month);
          END IF;
        END $$;
      `);

      // 3. Categories Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          icon VARCHAR(50) NOT NULL,
          color VARCHAR(20) NOT NULL,
          allocated_budget NUMERIC(12, 2) DEFAULT 0.00
        );
      `);

      // 4. Expenses Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS expenses (
          id SERIAL PRIMARY KEY,
          student_number VARCHAR(50) DEFAULT '230099774',
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

      // Add student_number to existing expenses table if missing
      await client.query(`
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS student_number VARCHAR(50) DEFAULT '230099774';
        UPDATE expenses SET student_number = '230099774' WHERE student_number IS NULL;
      `);

      // 5. Performance Indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_expenses_student_number ON expenses (student_number);
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_name);
        CREATE INDEX IF NOT EXISTS idx_budgets_student_number ON budgets (student_number);
        CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets (month);
        CREATE INDEX IF NOT EXISTS idx_students_student_number ON students (student_number);
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

