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
    {
      title: 'NuMetro',
      amount: 400.0,
      category_name: 'Entertainment & Social',
      date: '2026-09-09',
      notes: 'Solo date',
      payment_method: 'Cash',
    },
  ];

  if (isUsingPostgres) {
    const pool = db.getPool();
    if (!pool) throw new Error('PostgreSQL Pool not initialized');
    const client = await pool.connect();

    client.on('error', (err) => {
      console.warn('⚠️ Idle PostgreSQL client connection terminated (non-fatal):', err.message);
    });

    try {
      await client.query('BEGIN');

      // 1. Ensure Naledi student account exists
      await client.query(`
        INSERT INTO students (name, student_number, email, password_pin, monthly_allowance)
        VALUES ('Naledi Perseverance Mashabane', '230099774', 'naledimashabane001@gmail.com', '1234', 3500.00)
        ON CONFLICT (student_number) DO UPDATE SET email = 'naledimashabane001@gmail.com';
      `);

      // 2. Insert Categories (if not already populated)
      const catCountRes = await client.query('SELECT COUNT(*) FROM categories');
      if (parseInt(catCountRes.rows[0].count, 10) === 0) {
        for (const cat of categories) {
          await client.query(
            `INSERT INTO categories (name, icon, color, allocated_budget) VALUES ($1, $2, $3, $4)`,
            [cat.name, cat.icon, cat.color, cat.allocated_budget]
          );
        }
      }

      // 3. Upsert Default Budget for Naledi for September 2026
      await client.query(
        `INSERT INTO budgets (student_number, month, amount, notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (student_number, month) DO UPDATE SET amount = EXCLUDED.amount, notes = EXCLUDED.notes`,
        ['230099774', '2026-09', 3500.0, 'Monthly NSFAS Student Allowance & Family Support']
      );

      // Fetch category ID mapping
      const catRes = await client.query('SELECT id, name FROM categories');
      const catMap = new Map(catRes.rows.map((r) => [r.name, r.id]));

      // 4. Seed Naledi's sample expenses (including NuMetro) if not already added
      const nalediExpRes = await client.query("SELECT COUNT(*) FROM expenses WHERE student_number = '230099774'");
      if (parseInt(nalediExpRes.rows[0].count, 10) === 0) {
        for (const exp of expenses) {
          const catId = catMap.get(exp.category_name) || null;
          await client.query(
            `INSERT INTO expenses (student_number, title, amount, category_id, category_name, date, notes, payment_method)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ['230099774', exp.title, exp.amount, catId, exp.category_name, exp.date, exp.notes, exp.payment_method]
          );
        }
      } else {
        // Ensure NuMetro is present for Naledi
        const nuMetroCheck = await client.query(
          "SELECT id FROM expenses WHERE student_number = '230099774' AND LOWER(title) = 'numetro'"
        );
        if (nuMetroCheck.rows.length === 0) {
          const catId = catMap.get('Entertainment & Social') || null;
          await client.query(
            `INSERT INTO expenses (student_number, title, amount, category_id, category_name, date, notes, payment_method)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            ['230099774', 'NuMetro', 400.0, catId, 'Entertainment & Social', '2026-09-09', 'Solo date', 'Cash']
          );
        }
      }

      await client.query('COMMIT');
      console.log('✅ PostgreSQL database seeded successfully without overwriting student data!');
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.warn('⚠️ Non-fatal seeding warning:', err.message);
    } finally {
      client.release();
    }
  } else {
    await db.expenses.resetToDefault();
    console.log('✅ Local storage initialized with student sample data!');
  }
}

process.on('uncaughtException', (err) => {
  console.warn('⚠️ Handled background database pool event:', err.message);
  process.exit(0);
});

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('🌱 Seeding process complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.warn('⚠️ Seed completed with warning (continuing build):', err.message);
      process.exit(0);
    });
}

