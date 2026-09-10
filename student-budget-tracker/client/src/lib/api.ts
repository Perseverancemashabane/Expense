import { BudgetSummary, CategorySummary, Expense, AnalyticsSummary } from '../types';

// Resolve backend API URL: Use local backend when browsing on localhost, or production on Render/Vercel
const rawEnvUrl = process.env.NEXT_PUBLIC_API_URL || '';
const isBrowserLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isBrowserLocalhost
  ? 'http://localhost:5000/api'
  : (rawEnvUrl &&
     !rawEnvUrl.includes('YOUR-RENDER-APP-NAME') &&
     !rawEnvUrl.includes('placeholder') &&
     !rawEnvUrl.includes('student-budget-tracker-api') &&
     !rawEnvUrl.includes('localhost') &&
     rawEnvUrl.startsWith('https://')
       ? rawEnvUrl
       : 'https://expense-31tf.onrender.com/api');

// Initial student demo data for resilient offline / mobile fallback
const INITIAL_DEMO_DATA = {
  budget: {
    amount: 3500,
    month: '2026-09',
    notes: 'Monthly NSFAS Student Allowance & Family Support',
  },
  categories: [
    { category_id: 1, category_name: 'Food & Groceries', icon: 'Utensils', color: '#10B981', allocated_budget: 1200.0, total_spent: 540.5, expense_count: 2, percentage_of_total_spent: 34.1 },
    { category_id: 2, category_name: 'Transport & Taxi', icon: 'Bus', color: '#3B82F6', allocated_budget: 650.0, total_spent: 120.0, expense_count: 2, percentage_of_total_spent: 7.6 },
    { category_id: 3, category_name: 'Books & Stationery', icon: 'BookOpen', color: '#8B5CF6', allocated_budget: 450.0, total_spent: 255.0, expense_count: 2, percentage_of_total_spent: 16.1 },
    { category_id: 4, category_name: 'Airtime & Data Bundles', icon: 'Smartphone', color: '#F59E0B', allocated_budget: 300.0, total_spent: 149.0, expense_count: 1, percentage_of_total_spent: 9.4 },
    { category_id: 5, category_name: 'Personal Care & Toiletries', icon: 'Sparkles', color: '#EC4899', allocated_budget: 350.0, total_spent: 120.0, expense_count: 1, percentage_of_total_spent: 7.6 },
    { category_id: 6, category_name: 'Rent & Accommodation', icon: 'Home', color: '#6366F1', allocated_budget: 0.0, total_spent: 0.0, expense_count: 0, percentage_of_total_spent: 0.0 },
    { category_id: 7, category_name: 'Entertainment & Social', icon: 'Coffee', color: '#14B8A6', allocated_budget: 350.0, total_spent: 400.0, expense_count: 1, percentage_of_total_spent: 25.2 },
    { category_id: 8, category_name: 'Emergency & Other', icon: 'HelpCircle', color: '#64748B', allocated_budget: 200.0, total_spent: 0.0, expense_count: 0, percentage_of_total_spent: 0.0 },
  ],
  expenses: [
    {
      id: 9,
      title: 'NuMetro',
      amount: 400.0,
      category_id: 7,
      category_name: 'Entertainment & Social',
      date: '2026-09-09',
      notes: 'Solo date',
      payment_method: 'Cash',
    },
    {
      id: 8,
      title: 'Weekly Taxi Fare to Campus',
      amount: 90.0,
      category_id: 2,
      category_name: 'Transport & Taxi',
      date: '2026-09-09',
      notes: '3 trips to campus and lab sessions',
      payment_method: 'Cash',
    },
    {
      id: 7,
      title: 'TUT Engineering Textbook Photocopy & Binding',
      amount: 180.0,
      category_id: 3,
      category_name: 'Books & Stationery',
      date: '2026-09-08',
      notes: 'Reference chapters for microprocessor design',
      payment_method: 'Cash',
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
    },
    {
      id: 1,
      title: 'Checkers Grocery Shopping (Month Start)',
      amount: 485.5,
      category_id: 1,
      category_name: 'Food & Groceries',
      date: '2026-09-01',
      notes: 'Maize meal, milk, eggs, rice, canned beans, bread',
      payment_method: 'Debit Card',
    },
  ],
};

export function getActiveStudentNumber(): string {
  if (typeof window === 'undefined') return '230099774';
  try {
    const session = localStorage.getItem('tut_student_auth_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.studentNumber) return String(parsed.studentNumber).trim();
    }
  } catch {}
  return '230099774';
}

function getLocalStore() {
  if (typeof window === 'undefined') return INITIAL_DEMO_DATA;
  const studentNum = getActiveStudentNumber();
  const key = `student_budget_data_${studentNum}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (studentNum === '230099774') {
        localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_DATA));
        return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
      } else {
        const emptyStudentData = {
          budget: {
            amount: 3500,
            month: '2026-09',
            notes: 'Student Monthly Allowance',
          },
          categories: INITIAL_DEMO_DATA.categories.map((c) => ({
            ...c,
            total_spent: 0,
            expense_count: 0,
            percentage_of_total_spent: 0,
          })),
          expenses: [],
        };
        localStorage.setItem(key, JSON.stringify(emptyStudentData));
        return emptyStudentData;
      }
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DEMO_DATA;
  }
}

function saveLocalStore(data: any) {
  if (typeof window !== 'undefined') {
    try {
      const studentNum = getActiveStudentNumber();
      localStorage.setItem(`student_budget_data_${studentNum}`, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  }
}

// Check if the current browser context can safely contact the backend
function shouldUseLiveBackend(): boolean {
  if (typeof window === 'undefined') return false;
  // If loaded over HTTPS (such as on Vercel), Chrome strictly blocks insecure HTTP calls
  // to localhost under Mixed Content & Private Network Access rules.
  // Only attempt live API calls if API_BASE is HTTPS or if the site itself is on HTTP (localhost).
  if (window.location.protocol === 'https:' && API_BASE.startsWith('http:')) {
    return false;
  }
  return true;
}

// Fetch with automatic timeout so mobile/remote devices don't hang
async function safeFetch(url: string, options: RequestInit = {}, timeoutMs = 35000) {
  if (!shouldUseLiveBackend()) {
    throw new Error('Insecure HTTP backend blocked under HTTPS context. Using client storage.');
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(options.headers || {});
  const studentNum = getActiveStudentNumber();
  if (!headers.has('X-Student-Id')) {
    headers.set('X-Student-Id', studentNum);
  }
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err: any) {
    clearTimeout(id);
    if (err?.name === 'AbortError' || err?.message?.includes('aborted') || err?.message?.includes('abort')) {
      throw new Error('Connection timed out while waiting for server response. Please try again.');
    }
    console.warn('Live API request failed for', url, err);
    throw err;
  }
}

export async function fetchBudgetSummary(month = '2026-09') {
  try {
    if (shouldUseLiveBackend()) {
      const res = await safeFetch(`${API_BASE}/budget/current?month=${month}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    }
  } catch (err) {
    console.info('Backend unreachable, using client offline storage:', err);
  }

  // Fallback calculations
  const store = getLocalStore();
  const expenses = store.expenses.filter((e: any) => e.date.startsWith(month));
  const totalSpent = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const budgetAmount = Number(store.budget.amount || 3500);
  const remaining = budgetAmount - totalSpent;
  const percentage = (totalSpent / budgetAmount) * 100;
  const daysElapsed = 9;
  const daysRemaining = 22;

  const summary: BudgetSummary = {
    month,
    budget_amount: budgetAmount,
    total_spent: Math.round(totalSpent * 100) / 100,
    remaining_budget: Math.round(remaining * 100) / 100,
    percentage_spent: Math.round(percentage * 10) / 10,
    status: percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'safe',
    days_in_month: 30,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
    daily_burn_rate: Math.round((totalSpent / daysElapsed) * 100) / 100,
    recommended_daily_budget: Math.round((remaining / daysRemaining) * 100) / 100,
  };

  return {
    success: true,
    data: {
      budget: { id: 1, month, amount: budgetAmount, notes: store.budget.notes },
      summary,
    },
  };
}

export async function setBudget(month: string, amount: number, notes?: string) {
  try {
    const res = await safeFetch(`${API_BASE}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, amount, notes }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, saving budget to client storage:', err);
  }

  const store = getLocalStore();
  store.budget = { month, amount, notes: notes || store.budget.notes };
  saveLocalStore(store);
  return { success: true, message: 'Budget updated', data: store.budget };
}

export async function fetchExpenses(filters: {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  month?: string;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    if (filters.month) queryParams.append('month', filters.month);

    const res = await safeFetch(`${API_BASE}/expenses?${queryParams.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const result = await res.json();
      if (Array.isArray(result.data)) {
        const store = getLocalStore();
        store.expenses = result.data;
        saveLocalStore(store);
      }
      return result;
    }
  } catch (err) {
    console.info('Backend unreachable, filtering from client storage:', err);
  }

  const store = getLocalStore();
  let items = [...store.expenses];

  if (filters.category && filters.category !== 'All') {
    items = items.filter((e: any) => e.category_name.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters.startDate) {
    items = items.filter((e: any) => e.date >= filters.startDate!);
  }
  if (filters.endDate) {
    items = items.filter((e: any) => e.date <= filters.endDate!);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter((e: any) => e.title.toLowerCase().includes(s) || (e.notes && e.notes.toLowerCase().includes(s)));
  }

  const total = items.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  return {
    success: true,
    count: items.length,
    totalAmount: Math.round(total * 100) / 100,
    data: items,
  };
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category_name: string;
  date: string;
  notes?: string;
  payment_method?: string;
}) {
  const payload = {
    ...data,
    date: data.date ? data.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
  try {
    const res = await safeFetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, creating expense in client storage:', err);
  }

  const store = getLocalStore();
  const newId = store.expenses.length > 0 ? Math.max(...store.expenses.map((e: any) => e.id)) + 1 : 1;
  const newExp = {
    id: newId,
    ...payload,
    notes: payload.notes || '',
    payment_method: payload.payment_method || 'Cash',
    created_at: new Date().toISOString(),
  };
  store.expenses.unshift(newExp);
  saveLocalStore(store);
  return { success: true, message: 'Expense recorded', data: newExp };
}

export async function updateExpense(
  id: number,
  data: Partial<{
    title: string;
    amount: number;
    category_name: string;
    date: string;
    notes?: string;
    payment_method?: string;
  }>
) {
  const payload = {
    ...data,
    ...(data.date ? { date: data.date.slice(0, 10) } : {}),
  };
  try {
    const res = await safeFetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, updating expense in client storage:', err);
  }

  const store = getLocalStore();
  const idx = store.expenses.findIndex((e: any) => e.id === id);
  if (idx !== -1) {
    store.expenses[idx] = { ...store.expenses[idx], ...payload };
    saveLocalStore(store);
    return { success: true, message: 'Expense updated', data: store.expenses[idx] };
  }
  throw new Error('Expense not found');
}

export async function deleteExpense(id: number) {
  try {
    const res = await safeFetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, deleting from client storage:', err);
  }

  const store = getLocalStore();
  store.expenses = store.expenses.filter((e: any) => e.id !== id);
  saveLocalStore(store);
  return { success: true, message: 'Expense removed' };
}

export async function fetchCategories(month = '2026-09') {
  try {
    const res = await safeFetch(`${API_BASE}/categories?month=${month}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, calculating categories from client storage:', err);
  }

  const store = getLocalStore();
  const expenses = store.expenses.filter((e: any) => e.date.startsWith(month));
  const totalSpend = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const categories = store.categories.map((cat: any) => {
    const catExpenses = expenses.filter(
      (e: any) => e.category_name.toLowerCase() === cat.category_name.toLowerCase()
    );
    const spent = catExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const pct = totalSpend > 0 ? (spent / totalSpend) * 100 : 0;
    return {
      ...cat,
      total_spent: Math.round(spent * 100) / 100,
      expense_count: catExpenses.length,
      percentage_of_total_spent: Math.round(pct * 10) / 10,
    };
  });

  return {
    success: true,
    month,
    totalMonthSpend: Math.round(totalSpend * 100) / 100,
    data: categories,
  };
}

export async function fetchAnalyticsSummary(month = '2026-09') {
  try {
    const res = await safeFetch(`${API_BASE}/analytics/summary?month=${month}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, generating analytics from client storage:', err);
  }

  const store = getLocalStore();
  const expenses = store.expenses.filter((e: any) => e.date.startsWith(month));
  const totalSpent = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const budgetAmount = Number(store.budget.amount || 3500);
  const remaining = budgetAmount - totalSpent;
  const percentage = (totalSpent / budgetAmount) * 100;

  // Daily trend
  const dailyTrend = [];
  for (let day = 1; day <= 30; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    const dayExpenses = expenses.filter((e: any) => e.date === dateStr);
    const dayAmount = dayExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    dailyTrend.push({ date: dateStr, day, amount: Math.round(dayAmount * 100) / 100 });
  }

  // Payment channels
  const pmMap: Record<string, number> = {};
  for (const e of expenses) {
    const pm = e.payment_method || 'Cash';
    pmMap[pm] = (pmMap[pm] || 0) + Number(e.amount);
  }
  const paymentMethods = Object.entries(pmMap).map(([method, amount]) => ({
    method,
    amount: Math.round(amount * 100) / 100,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 1000) / 10 : 0,
  }));

  const analytics: AnalyticsSummary = {
    month,
    budget: {
      amount: budgetAmount,
      total_spent: Math.round(totalSpent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentage_spent: Math.round(percentage * 10) / 10,
      healthStatus: percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'healthy',
      insightMessage:
        percentage >= 100
          ? `You have exceeded your student allowance by R ${Math.abs(remaining).toFixed(2)}.`
          : percentage >= 80
          ? `You have utilized ${percentage.toFixed(1)}% of your monthly allowance.`
          : `Great financial discipline! You still have R ${remaining.toFixed(2)} available.`,
    },
    categoryBreakdown: store.categories,
    dailyTrend,
    paymentMethods,
    recentExpenses: expenses.slice(0, 5),
  };

  return { success: true, ...analytics };
}

export async function resetDatabase() {
  try {
    const res = await safeFetch(`${API_BASE}/reset`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.info('Backend unreachable, resetting client storage:', err);
  }

  saveLocalStore(INITIAL_DEMO_DATA);
  return { success: true, message: 'Reset to default student demo records' };
}

export async function loginStudentAccount(username: string, pin?: string) {
  try {
    const res = await safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pin }),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Authentication failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server unreachable' };
  }
}

export async function registerStudentAccount(data: {
  name: string;
  studentNumber: string;
  email?: string;
  phoneNumber?: string;
  pin?: string;
  monthlyAllowance?: number;
}) {
  try {
    const res = await safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        studentNumber: data.studentNumber,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.pin || '1234',
        monthlyAllowance: data.monthlyAllowance || 3500,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Registration failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server unreachable' };
  }
}

export async function requestPasswordReset(identifier: string, deliveryMethod: string = 'email') {
  try {
    const res = await safeFetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, deliveryMethod }),
    }, 35000);
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Password reset request failed' };
  } catch (err: any) {
    const isTimeout =
      err?.message?.toLowerCase().includes('timed out') ||
      err?.message?.toLowerCase().includes('abort');
    if (isTimeout) {
      return {
        success: false,
        error: 'The server was waking up from sleep. Please click "Send Verification Code" once more.',
      };
    }
    return { success: false, error: err.message || 'Server unreachable' };
  }
}

export async function confirmPasswordReset(studentNumber: string, token: string, newPassword: string) {
  try {
    const res = await safeFetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentNumber, token, newPassword }),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Password update failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server unreachable' };
  }
}

export async function resetPasswordById(studentNumber: string, idNumber: string, newPassword: string) {
  try {
    const res = await safeFetch(`${API_BASE}/auth/reset-password-by-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentNumber, idNumber, newPassword }),
    }, 15000);
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Identity verification and password reset failed' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Server unreachable' };
  }
}



