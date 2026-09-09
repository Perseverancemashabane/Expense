export interface Budget {
  id: number;
  month: string; // YYYY-MM
  amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  allocated_budget: number;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category_id?: number | null;
  category_name: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  payment_method: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetSummary {
  month: string;
  budget_amount: number;
  total_spent: number;
  remaining_budget: number;
  percentage_spent: number;
  status: 'safe' | 'warning' | 'danger';
  days_in_month: number;
  days_elapsed: number;
  days_remaining: number;
  daily_burn_rate: number;
  recommended_daily_budget: number;
}

export interface CategorySummary {
  category_id: number | null;
  category_name: string;
  icon: string;
  color: string;
  allocated_budget: number;
  total_spent: number;
  expense_count: number;
  percentage_of_total_spent: number;
}

