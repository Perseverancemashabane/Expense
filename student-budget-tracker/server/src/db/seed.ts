import { db, testConnection, isUsingPostgres } from '../config/db';
import { runMigration } from './migrate';
import dotenv from 'dotenv';

dotenv.config();

export async function runSeed() {
  console.log('🌱 Starting database seeding...');
  await runMigration();

  const categories = [
    { name: 'Food & Groceries', icon: 'Utensils', color: '#10B981', allocated_budget: 1200.0 },
    { name: 'Transport & Taxi', icon: 'Bus', color: '#3B82F6', allocated_budget: 650.0 },
    { name: 'Books & Stationery', icon: 'BookOpen', color: '#8B5CF6', allocated_budget: 450.0 },
    { name: 'Airtime & Data Bundles', icon: 'Smartphone', color: '#F59E0B', allocated_budget: 300.0 },
    { name: 'Personal Care & Toiletries', icon: 'Sparkles', color: '#EC4899', allocated_budget: 350.0 },
    { name: 'Rent & Accommodation', icon: 'Home', color: '#6366F1', allocated_budget: 0.0 },
    { name: 'Entertainment & Social', icon: 'Coffee', color: '#14B8A6', allocated_budget: 350.0 },
    { name: 'Emergency & Other', icon: 'HelpCircle', color: '#64748B', allocated_budget: 200.0 },
  ];

  const expenses = [
    {
      title: 'Checkers Grocery Shopping (Month Start)',
      amount: 485.5,
      category_name: 'Food & Groceries',
      date: '2026-09-01',
      notes: 'Maize meal, milk, eggs, rice, canned beans, bread',
      payment_method: 'Debit Card',
    },
    {
      title: 'Minibus Taxi to TUT Campus',
      amount: 30.0,
      category_name: 'Transport & Taxi',
      date: '2026-09-02',
      notes: 'Soshanguve to Pretoria Central return fare',
      payment_method: 'Cash',
    },
    {
      title: 'MTN 15GB Student Night Express & Day Data',
      amount: 149.0,
      category_name: 'Airtime & Data Bundles',
      date: '2026-09-03',
      notes: 'For online lectures and lab downloads',
      payment_method: 'EFT',
    },
    {
      title: 'Computer Systems Engineering Lab Printing',
      amount: 75.0,
      category_name: 'Books & Stationery',
      date: '2026-09-04',
      notes: 'PJD301B design proposal drafts & schematics',
      payment_method: 'Campus Card',
    },
    {
      title: 'Campus Cafeteria Lunch (Quarter Chicken & Pap)',
      amount: 55.0,
      category_name: 'Food & Groceries',
      date: '2026-09-06',
      notes: 'Student center lunch with study group',
      payment_method: 'Cash',
    },
    {
      title: 'Clicks Pharmacy Toiletries & Soap',
      amount: 120.0,
      category_name: 'Personal Care & Toiletries',
      date: '2026-09-07',
      notes: 'Bath soap, toothpaste, deodorant',
      payment_method: 'Debit Card',
    },
    {
      title: 'TUT Engineering Textbook Photocopy & Binding',
      amount: 180.0,
      category_name: 'Books & Stationery',
      date: '2026-09-08',
      notes: 'Reference chapters for microprocessor design',
      payment_method: 'Cash',
    },
    {
      title: 'Weekly Taxi Fare to Campus',
      amount: 90.0,
      category_name: 'Transport & Taxi',
      date: '2026-09-09',
      notes: '3 trips to campus and lab sessions',
      payment_method: 'Cash',
    },
  ];

  if (isUsingPostgres) {
    const pool = db.getPool();
    if (!pool) throw new Error('PostgreSQL Pool not initialized');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Clear existing records for clean seed
      await client.query('TRUNCATE TABLE expenses, categories, budgets RESTART IDENTITY CASCADE;');

      // 1. Insert Categories
      for (const cat of categories) {
        await client.query(
          `INSERT INTO categories (name, icon, color, allocated_budget) VALUES ($1, $2, $3, $4)`,
          [cat.name, cat.icon, cat.color, cat.allocated_budget]
        );
      }

      // 2. Insert Default Budget for September 2026
      await client.query(
        `INSERT INTO budgets (month, amount, notes) VALUES ($1, $2, $3)`,
        ['2026-09', 3500.0, 'Monthly NSFAS Student Allowance & Family Support']
      );

      // Fetch category ID mapping
      const catRes = await client.query('SELECT id, name FROM categories');
      const catMap = new Map(catRes.rows.map((r) => [r.name, r.id]));

      // 3. Insert Expenses
      for (const exp of expenses) {
        const catId = catMap.get(exp.category_name) || null;
        await client.query(
          `INSERT INTO expenses (title, amount, category_id, category_name, date, notes, payment_method)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [exp.title, exp.amount, catId, exp.category_name, exp.date, exp.notes, exp.payment_method]
        );
      }

      await client.query('COMMIT');
      console.log('✅ PostgreSQL database seeded successfully with student budget and expenses!');
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('❌ Seeding error:', err.message);
      throw err;
    } finally {
      client.release();
    }
  } else {
    await db.expenses.resetToDefault();
    console.log('✅ Local storage initialized with student sample data!');
  }
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed script failed:', err);
      process.exit(1);
    });
}

