import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

export let isUsingPostgres = false;
let pool: Pool | null = null;

// Local fallback data storage file path
const DATA_DIR = path.join(__dirname, '../../.data');
const DATA_FILE = path.join(DATA_DIR, 'db_fallback.json');

// Initial default seed state for fallback mode
const DEFAULT_FALLBACK_DATA = {
  budgets: [
    {
      id: 1,
      month: '2026-09',
      amount: 3500.0,
      notes: 'Monthly NSFAS Student Allowance & Family Support',
      created_at: new Date('2026-09-01T08:00:00Z').toISOString(),
      updated_at: new Date('2026-09-01T08:00:00Z').toISOString(),
    },
  ],
  categories: [
    { id: 1, name: 'Food & Groceries', icon: 'Utensils', color: '#10B981', allocated_budget: 1200.0 },
    { id: 2, name: 'Transport & Taxi', icon: 'Bus', color: '#3B82F6', allocated_budget: 650.0 },
    { id: 3, name: 'Books & Stationery', icon: 'BookOpen', color: '#8B5CF6', allocated_budget: 450.0 },
    { id: 4, name: 'Airtime & Data Bundles', icon: 'Smartphone', color: '#F59E0B', allocated_budget: 300.0 },
    { id: 5, name: 'Personal Care & Toiletries', icon: 'Sparkles', color: '#EC4899', allocated_budget: 350.0 },
    { id: 6, name: 'Rent & Accommodation', icon: 'Home', color: '#6366F1', allocated_budget: 0.0 },
    { id: 7, name: 'Entertainment & Social', icon: 'Coffee', color: '#14B8A6', allocated_budget: 350.0 },
    { id: 8, name: 'Emergency & Other', icon: 'HelpCircle', color: '#64748B', allocated_budget: 200.0 },
  ],
  expenses: [
    {
      id: 1,
      title: 'Checkers Grocery Shopping (Month Start)',
      amount: 485.5,
      category_id: 1,
      category_name: 'Food & Groceries',
      date: '2026-09-01',
      notes: 'Maize meal, milk, eggs, rice, canned beans, bread',
      payment_method: 'Debit Card',
      created_at: new Date('2026-09-01T14:30:00Z').toISOString(),
      updated_at: new Date('2026-09-01T14:30:00Z').toISOString(),
    },
    {
      id: 2,
      title: 'Minibus Taxi to TUT Campus',
      amount: 30.0,
      category_id: 2,
      category_name: 'Transport & Taxi',
      date: '2026-09-02',
      notes: 'Soshanguve to Pretoria Central return fare',
      payment_method: 'Cash',
      created_at: new Date('2026-09-02T07:15:00Z').toISOString(),
      updated_at: new Date('2026-09-02T07:15:00Z').toISOString(),
    },
    {
      id: 3,
      title: 'MTN 15GB Student Night Express & Day Data',
      amount: 149.0,
      category_id: 4,
      category_name: 'Airtime & Data Bundles',
      date: '2026-09-03',
      notes: 'For online lectures and lab downloads',
      payment_method: 'EFT',
      created_at: new Date('2026-09-03T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-03T10:00:00Z').toISOString(),
    },
    {
      id: 4,
      title: 'Computer Systems Engineering Lab Printing',
      amount: 75.0,
      category_id: 3,
      category_name: 'Books & Stationery',
      date: '2026-09-04',
      notes: 'PJD301B design proposal drafts & schematics',
      payment_method: 'Campus Card',
      created_at: new Date('2026-09-04T12:45:00Z').toISOString(),
      updated_at: new Date('2026-09-04T12:45:00Z').toISOString(),
    },
    {
      id: 5,
      title: 'Campus Cafeteria Lunch (Quarter Chicken & Pap)',
      amount: 55.0,
      category_id: 1,
      category_name: 'Food & Groceries',
      date: '2026-09-06',
      notes: 'Student center lunch with study group',
      payment_method: 'Cash',
      created_at: new Date('2026-09-06T13:20:00Z').toISOString(),
      updated_at: new Date('2026-09-06T13:20:00Z').toISOString(),
    },
    {
      id: 6,
      title: 'Clicks Pharmacy Toiletries & Soap',
      amount: 120.0,
      category_id: 5,
      category_name: 'Personal Care & Toiletries',
      date: '2026-09-07',
      notes: 'Bath soap, toothpaste, deodorant',
      payment_method: 'Debit Card',
      created_at: new Date('2026-09-07T16:10:00Z').toISOString(),
      updated_at: new Date('2026-09-07T16:10:00Z').toISOString(),
    },
  ],
};

function getLocalData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_FALLBACK_DATA, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(DEFAULT_FALLBACK_DATA));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local fallback file, using in-memory state:', err);
    return DEFAULT_FALLBACK_DATA;
  }
}

function saveLocalData(data: typeof DEFAULT_FALLBACK_DATA) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local fallback file:', err);
  }
}

export function initDatabase() {
  if (connectionString) {
    try {
      const isCloudDb = connectionString.includes('neon.tech') || connectionString.includes('render.com');
      pool = new Pool({
        connectionString,
        ssl: isCloudDb || isProduction ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client:', err.message);
      });
    } catch (e: any) {
      console.warn('Failed to initialize PostgreSQL pool:', e.message);
    }
  }
}

export async function testConnection(): Promise<{ connected: boolean; message: string; mode: string }> {
  if (!pool) {
    initDatabase();
  }

  if (pool) {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as now');
      client.release();
      isUsingPostgres = true;
      return {
        connected: true,
        message: `Connected to PostgreSQL database at ${res.rows[0].now}`,
        mode: 'PostgreSQL',
      };
    } catch (err: any) {
      isUsingPostgres = false;
      return {
        connected: false,
        message: `PostgreSQL connection failed: ${err.message}. Operating in resilient local storage mode.`,
        mode: 'Local File / Memory Store',
      };
    }
  }

  isUsingPostgres = false;
  return {
    connected: false,
    message: 'DATABASE_URL not configured. Operating in resilient local storage mode.',
    mode: 'Local File / Memory Store',
  };
}

export const db = {
  // Direct query runner for PostgreSQL
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (pool && isUsingPostgres) {
      return pool.query<T>(text, params);
    }
    throw new Error('PostgreSQL is not active. Use repository methods for persistent operations.');
  },

  getPool(): Pool | null {
    return pool;
  },

  // Storage Repository for Students
  students: {
    async create(student: {
      name: string;
      student_number: string;
      email: string;
      phone_number?: string;
      id_number?: string;
      password_pin?: string;
      monthly_allowance?: number;
    }) {
      const allowance = Number(student.monthly_allowance) || 3500.0;
      const cleanPhone = student.phone_number ? student.phone_number.trim() : null;
      const cleanIdNum = student.id_number ? student.id_number.trim() : null;
      if (pool && isUsingPostgres) {
        const query = `
          INSERT INTO students (name, student_number, email, phone_number, id_number, password_pin, monthly_allowance, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (student_number)
          DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone_number = COALESCE(EXCLUDED.phone_number, students.phone_number), id_number = COALESCE(EXCLUDED.id_number, students.id_number), password_pin = EXCLUDED.password_pin, monthly_allowance = EXCLUDED.monthly_allowance, updated_at = NOW()
          RETURNING *;
        `;
        const res = await pool.query(query, [
          student.name.trim(),
          student.student_number.trim(),
          student.email.trim().toLowerCase(),
          cleanPhone,
          cleanIdNum,
          student.password_pin || '1234',
          allowance,
        ]);
        return res.rows[0];
      }

      const data = getLocalData();
      if (!data.students) data.students = [];
      const existing = data.students.find((s: any) => s.student_number === student.student_number.trim());
      const now = new Date().toISOString();
      if (existing) {
        existing.name = student.name.trim();
        existing.email = student.email.trim().toLowerCase();
        if (cleanPhone) existing.phone_number = cleanPhone;
        if (cleanIdNum) existing.id_number = cleanIdNum;
        existing.password_pin = student.password_pin || existing.password_pin || '1234';
        existing.monthly_allowance = allowance;
        existing.updated_at = now;
        saveLocalData(data);
        return existing;
      }
      const newStudent = {
        id: data.students.length + 1,
        name: student.name.trim(),
        student_number: student.student_number.trim(),
        email: student.email.trim().toLowerCase(),
        phone_number: cleanPhone,
        id_number: cleanIdNum,
        password_pin: student.password_pin || '1234',
        monthly_allowance: allowance,
        created_at: now,
        updated_at: now,
      };
      data.students.push(newStudent);
      saveLocalData(data);
      return newStudent;
    },

    async findByStudentNumber(studentNumber: string) {
      const clean = studentNumber.trim();
      if (pool && isUsingPostgres) {
        const res = await pool.query('SELECT * FROM students WHERE student_number = $1', [clean]);
        return res.rows[0] || null;
      }
      const data = getLocalData();
      if (!data.students) data.students = [];
      return data.students.find((s: any) => s.student_number === clean) || null;
    },

    async findByEmail(email: string) {
      const clean = email.trim().toLowerCase();
      if (pool && isUsingPostgres) {
        const res = await pool.query('SELECT * FROM students WHERE LOWER(email) = $1', [clean]);
        return res.rows[0] || null;
      }
      const data = getLocalData();
      if (!data.students) data.students = [];
      return data.students.find((s: any) => s.email && s.email.toLowerCase() === clean) || null;
    },

    async findByPhone(phone: string) {
      const rawDigits = phone.replace(/\D/g, '');
      if (!rawDigits) return null;

      // Also get alternative South African formats
      const localFormat = rawDigits.startsWith('27') ? '0' + rawDigits.slice(2) : rawDigits;
      const intlFormat = rawDigits.startsWith('0') ? '27' + rawDigits.slice(1) : rawDigits;

      if (pool && isUsingPostgres) {
        const query = `
          SELECT * FROM students 
          WHERE regexp_replace(phone_number, '[^0-9]', '', 'g') IN ($1, $2, $3)
          LIMIT 1
        `;
        const res = await pool.query(query, [rawDigits, localFormat, intlFormat]);
        return res.rows[0] || null;
      }

      const data = getLocalData();
      if (!data.students) data.students = [];
      return data.students.find((s: any) => {
        if (!s.phone_number) return false;
        const sDigits = String(s.phone_number).replace(/\D/g, '');
        return sDigits === rawDigits || sDigits === localFormat || sDigits === intlFormat;
      }) || null;
    },

    async getAll() {
      if (pool && isUsingPostgres) {
        const res = await pool.query('SELECT id, name, student_number, email, phone_number, monthly_allowance, created_at FROM students ORDER BY id ASC');
        return res.rows;
      }
      const data = getLocalData();
      return data.students || [];
    },

    async saveResetToken(studentNumber: string, token: string, expiresAt: Date) {
      const clean = studentNumber.trim();
      if (pool && isUsingPostgres) {
        const res = await pool.query(
          'UPDATE students SET reset_token = $1, reset_token_expires = $2, updated_at = NOW() WHERE student_number = $3 RETURNING *',
          [token, expiresAt, clean]
        );
        return res.rows[0] || null;
      }
      const data = getLocalData();
      if (!data.students) data.students = [];
      const student = data.students.find((s: any) => s.student_number === clean);
      if (student) {
        student.reset_token = token;
        student.reset_token_expires = expiresAt.toISOString();
        saveLocalData(data);
        return student;
      }
      return null;
    },

    async verifyResetToken(studentNumber: string, token: string) {
      const clean = studentNumber.trim();
      const cleanToken = token.trim();
      if (pool && isUsingPostgres) {
        const res = await pool.query(
          'SELECT * FROM students WHERE student_number = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
          [clean, cleanToken]
        );
        return res.rows[0] || null;
      }
      const data = getLocalData();
      if (!data.students) data.students = [];
      const student = data.students.find(
        (s: any) => s.student_number === clean && s.reset_token === cleanToken
      );
      if (student && student.reset_token_expires && new Date(student.reset_token_expires) > new Date()) {
        return student;
      }
      return null;
    },

    async resetPassword(studentNumber: string, newPasswordPin: string) {
      const clean = studentNumber.trim();
      const newPin = newPasswordPin.trim();
      if (pool && isUsingPostgres) {
        const res = await pool.query(
          'UPDATE students SET password_pin = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE student_number = $2 RETURNING *',
          [newPin, clean]
        );
        return res.rows[0] || null;
      }
      const data = getLocalData();
      if (!data.students) data.students = [];
      const student = data.students.find((s: any) => s.student_number === clean);
      if (student) {
        student.password_pin = newPin;
        delete student.reset_token;
        delete student.reset_token_expires;
        student.updated_at = new Date().toISOString();
        saveLocalData(data);
        return student;
      }
      return null;
    },

    async verifyIdentityAndResetPassword(studentNumber: string, idNumber: string, newPasswordPin: string) {
      const cleanNum = studentNumber.trim();
      const cleanId = idNumber.trim().replace(/\s+/g, '');
      const newPin = newPasswordPin.trim();

      if (pool && isUsingPostgres) {
        // Find student by student number
        const findRes = await pool.query('SELECT * FROM students WHERE student_number = $1', [cleanNum]);
        let student = findRes.rows[0];

        if (!student) {
          // If demo student and not yet created in PostgreSQL
          if (cleanNum === '230099774') {
            student = await db.students.create({
              name: 'Naledi Perseverance Mashabane',
              student_number: '230099774',
              email: 'naledimashabane001@gmail.com',
              id_number: cleanId,
              phone_number: '0710000000',
              password_pin: newPin,
              monthly_allowance: 3500,
            });
            return { success: true, student };
          }
          return { success: false, error: `No student account found with student number "${cleanNum}".` };
        }

        const dbId = (student.id_number || '').trim().replace(/\s+/g, '');
        // If student has an existing registered ID number, verify match
        if (dbId) {
          if (dbId.toLowerCase() !== cleanId.toLowerCase()) {
            return { success: false, error: 'The entered South African ID number does not match student records.' };
          }
        } else {
          // If student has no registered ID number yet, register this ID number to their profile
          await pool.query('UPDATE students SET id_number = $1 WHERE student_number = $2', [cleanId, cleanNum]);
        }

        // Update password
        const updateRes = await pool.query(
          'UPDATE students SET password_pin = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE student_number = $2 RETURNING *',
          [newPin, cleanNum]
        );

        return { success: true, student: updateRes.rows[0] };
      }

      // Local fallback
      const data = getLocalData();
      if (!data.students) data.students = [];
      let student = data.students.find((s: any) => s.student_number === cleanNum);

      if (!student) {
        if (cleanNum === '230099774') {
          student = await db.students.create({
            name: 'Naledi Perseverance Mashabane',
            student_number: '230099774',
            email: 'naledimashabane001@gmail.com',
            id_number: cleanId,
            phone_number: '0710000000',
            password_pin: newPin,
            monthly_allowance: 3500,
          });
          return { success: true, student };
        }
        return { success: false, error: `No student account found with student number "${cleanNum}".` };
      }

      const dbId = (student.id_number || '').trim().replace(/\s+/g, '');
      if (dbId && dbId.toLowerCase() !== cleanId.toLowerCase()) {
        return { success: false, error: 'The entered South African ID number does not match student records.' };
      }

      student.id_number = cleanId;
      student.password_pin = newPin;
      delete student.reset_token;
      delete student.reset_token_expires;
      student.updated_at = new Date().toISOString();
      saveLocalData(data);

      return { success: true, student };
    },
  },

  // Storage Repository for Budgets (Isolated per student)
  budgets: {
    async getByMonth(month: string, studentNumber: string = '230099774') {
      if (pool && isUsingPostgres) {
        const res = await pool.query(
          'SELECT * FROM budgets WHERE month = $1 AND student_number = $2',
          [month, studentNumber]
        );
        return res.rows[0] || null;
      }
      const data = getLocalData();
      return data.budgets.find((b: any) => b.month === month && (b.student_number || '230099774') === studentNumber) || null;
    },

    async upsert(month: string, amount: number, notes: string = '', studentNumber: string = '230099774') {
      if (pool && isUsingPostgres) {
        const query = `
          INSERT INTO budgets (student_number, month, amount, notes, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (student_number, month)
          DO UPDATE SET amount = EXCLUDED.amount, notes = EXCLUDED.notes, updated_at = NOW()
          RETURNING *;
        `;
        const res = await pool.query(query, [studentNumber, month, amount, notes]);
        return res.rows[0];
      }
      const data = getLocalData();
      const existingIndex = data.budgets.findIndex(
        (b: any) => b.month === month && (b.student_number || '230099774') === studentNumber
      );
      const now = new Date().toISOString();
      if (existingIndex >= 0) {
        data.budgets[existingIndex].amount = Number(amount);
        data.budgets[existingIndex].notes = notes;
        data.budgets[existingIndex].updated_at = now;
        saveLocalData(data);
        return data.budgets[existingIndex];
      } else {
        const newBudget = {
          id: data.budgets.length > 0 ? Math.max(...data.budgets.map((b: any) => b.id)) + 1 : 1,
          student_number: studentNumber,
          month,
          amount: Number(amount),
          notes,
          created_at: now,
          updated_at: now,
        };
        data.budgets.push(newBudget);
        saveLocalData(data);
        return newBudget;
      }
    },
  },

  // Storage Repository for Categories
  categories: {
    async getAll() {
      if (pool && isUsingPostgres) {
        const res = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        return res.rows;
      }
      const data = getLocalData();
      return data.categories;
    },

    async getById(id: number) {
      if (pool && isUsingPostgres) {
        const res = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      const data = getLocalData();
      return data.categories.find((c: any) => c.id === id) || null;
    },
  },

  // Storage Repository for Expenses (Isolated per student)
  expenses: {
    async getAll(filters: {
      studentNumber?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}) {
      const studentNum = (filters.studentNumber || '230099774').trim();

      if (pool && isUsingPostgres) {
        let query = 'SELECT * FROM expenses WHERE student_number = $1';
        const params: any[] = [studentNum];
        let paramIndex = 2;

        if (filters.category && filters.category !== 'All') {
          query += ` AND category_name = $${paramIndex++}`;
          params.push(filters.category);
        }
        if (filters.startDate) {
          query += ` AND date >= $${paramIndex++}`;
          params.push(filters.startDate);
        }
        if (filters.endDate) {
          query += ` AND date <= $${paramIndex++}`;
          params.push(filters.endDate);
        }
        if (filters.search) {
          query += ` AND (LOWER(title) LIKE $${paramIndex} OR LOWER(COALESCE(notes, '')) LIKE $${paramIndex})`;
          params.push(`%${filters.search.toLowerCase()}%`);
          paramIndex++;
        }

        const sortBy = ['date', 'amount', 'title'].includes(filters.sortBy || '') ? filters.sortBy : 'date';
        const sortOrder = (filters.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortBy} ${sortOrder}, id DESC`;

        const res = await pool.query(query, params);
        return res.rows;
      }

      const data = getLocalData();
      let results = data.expenses.filter((e: any) => (e.student_number || '230099774') === studentNum);

      if (filters.category && filters.category !== 'All') {
        results = results.filter((e: any) => e.category_name.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.startDate) {
        results = results.filter((e: any) => e.date >= filters.startDate!);
      }
      if (filters.endDate) {
        results = results.filter((e: any) => e.date <= filters.endDate!);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        results = results.filter((e: any) => e.title.toLowerCase().includes(s) || (e.notes && e.notes.toLowerCase().includes(s)));
      }

      const sortBy = filters.sortBy || 'date';
      const isAsc = filters.sortOrder === 'asc';

      results.sort((a: any, b: any) => {
        if (sortBy === 'amount') {
          return isAsc ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortBy === 'title') {
          return isAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        }
        // default by date
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return isAsc ? dateCompare : -dateCompare;
        return isAsc ? a.id - b.id : b.id - a.id;
      });

      return results;
    },

    async getById(id: number, studentNumber?: string) {
      if (pool && isUsingPostgres) {
        if (studentNumber) {
          const res = await pool.query('SELECT * FROM expenses WHERE id = $1 AND student_number = $2', [id, studentNumber.trim()]);
          return res.rows[0] || null;
        }
        const res = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      const data = getLocalData();
      return data.expenses.find((e: any) => e.id === id && (!studentNumber || (e.student_number || '230099774') === studentNumber.trim())) || null;
    },

    async create(expense: {
      student_number?: string;
      title: string;
      amount: number;
      category_id?: number | null;
      category_name: string;
      date: string;
      notes?: string;
      payment_method?: string;
    }) {
      const studentNum = (expense.student_number || '230099774').trim();

      if (pool && isUsingPostgres) {
        const query = `
          INSERT INTO expenses (student_number, title, amount, category_id, category_name, date, notes, payment_method, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *;
        `;
        const res = await pool.query(query, [
          studentNum,
          expense.title,
          expense.amount,
          expense.category_id || null,
          expense.category_name,
          expense.date,
          expense.notes || '',
          expense.payment_method || 'Cash',
        ]);
        return res.rows[0];
      }

      const data = getLocalData();
      const newId = data.expenses.length > 0 ? Math.max(...data.expenses.map((e: any) => e.id)) + 1 : 1;
      const now = new Date().toISOString();
      const newExpense = {
        id: newId,
        student_number: studentNum,
        title: expense.title,
        amount: Number(expense.amount),
        category_id: expense.category_id || null,
        category_name: expense.category_name,
        date: expense.date,
        notes: expense.notes || '',
        payment_method: expense.payment_method || 'Cash',
        created_at: now,
        updated_at: now,
      };
      data.expenses.push(newExpense);
      saveLocalData(data);
      return newExpense;
    },

    async update(id: number, fields: Partial<{
      title: string;
      amount: number;
      category_id?: number | null;
      category_name: string;
      date: string;
      notes?: string;
      payment_method?: string;
    }>, studentNumber?: string) {
      if (pool && isUsingPostgres) {
        const setClauses: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (fields.title !== undefined) {
          setClauses.push(`title = $${idx++}`);
          params.push(fields.title);
        }
        if (fields.amount !== undefined) {
          setClauses.push(`amount = $${idx++}`);
          params.push(fields.amount);
        }
        if (fields.category_id !== undefined) {
          setClauses.push(`category_id = $${idx++}`);
          params.push(fields.category_id);
        }
        if (fields.category_name !== undefined) {
          setClauses.push(`category_name = $${idx++}`);
          params.push(fields.category_name);
        }
        if (fields.date !== undefined) {
          setClauses.push(`date = $${idx++}`);
          params.push(fields.date);
        }
        if (fields.notes !== undefined) {
          setClauses.push(`notes = $${idx++}`);
          params.push(fields.notes);
        }
        if (fields.payment_method !== undefined) {
          setClauses.push(`payment_method = $${idx++}`);
          params.push(fields.payment_method);
        }

        setClauses.push(`updated_at = NOW()`);
        params.push(id);

        let query = `
          UPDATE expenses
          SET ${setClauses.join(', ')}
          WHERE id = $${idx++}
        `;

        if (studentNumber) {
          query += ` AND student_number = $${idx}`;
          params.push(studentNumber.trim());
        }

        query += ' RETURNING *;';

        const res = await pool.query(query, params);
        return res.rows[0] || null;
      }

      const data = getLocalData();
      const itemIndex = data.expenses.findIndex(
        (e: any) => e.id === id && (!studentNumber || (e.student_number || '230099774') === studentNumber.trim())
      );
      if (itemIndex === -1) return null;

      const updated = {
        ...data.expenses[itemIndex],
        ...fields,
        amount: fields.amount !== undefined ? Number(fields.amount) : data.expenses[itemIndex].amount,
        updated_at: new Date().toISOString(),
      };
      data.expenses[itemIndex] = updated;
      saveLocalData(data);
      return updated;
    },

    async delete(id: number, studentNumber?: string) {
      if (pool && isUsingPostgres) {
        if (studentNumber) {
          const res = await pool.query('DELETE FROM expenses WHERE id = $1 AND student_number = $2 RETURNING *', [id, studentNumber.trim()]);
          return (res.rowCount ?? 0) > 0;
        }
        const res = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
        return (res.rowCount ?? 0) > 0;
      }

      const data = getLocalData();
      const initialLen = data.expenses.length;
      data.expenses = data.expenses.filter(
        (e: any) => !(e.id === id && (!studentNumber || (e.student_number || '230099774') === studentNumber.trim()))
      );
      const deleted = data.expenses.length < initialLen;
      if (deleted) {
        saveLocalData(data);
      }
      return deleted;
    },

    async resetToDefault() {
      saveLocalData(DEFAULT_FALLBACK_DATA);
      return true;
    }
  },
};

// Auto-initialize on import
initDatabase();
