const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchBudgetSummary(month = '2026-09') {
  const res = await fetch(`${API_BASE}/budget/current?month=${month}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch budget summary');
  return res.json();
}

export async function setBudget(month: string, amount: number, notes?: string) {
  const res = await fetch(`${API_BASE}/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, amount, notes }),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update budget');
  }
  return res.json();
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
  const queryParams = new URLSearchParams();
  if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
  if (filters.month) queryParams.append('month', filters.month);

  const url = `${API_BASE}/expenses?${queryParams.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category_name: string;
  date: string;
  notes?: string;
  payment_method?: string;
}) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to create expense');
  }
  return res.json();
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
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update expense');
  }
  return res.json();
}

export async function deleteExpense(id: number) {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to delete expense');
  }
  return res.json();
}

export async function fetchCategories(month = '2026-09') {
  const res = await fetch(`${API_BASE}/categories?month=${month}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchAnalyticsSummary(month = '2026-09') {
  const res = await fetch(`${API_BASE}/analytics/summary?month=${month}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch analytics summary');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}

