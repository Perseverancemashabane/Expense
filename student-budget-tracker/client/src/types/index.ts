export interface Budget {
  id: number;
  month: string;
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
  date: string;
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

export interface AnalyticsSummary {
  month: string;
  budget: {
    amount: number;
    total_spent: number;
    remaining: number;
    percentage_spent: number;
    healthStatus: 'healthy' | 'warning' | 'danger';
    insightMessage: string;
  };
  categoryBreakdown: {
    id: number;
    name: string;
    icon: string;
    color: string;
    allocated_budget: number;
    total_spent: number;
    percentage: number;
    count: number;
  }[];
  dailyTrend: {
    date: string;
    day: number;
    amount: number;
  }[];
  paymentMethods: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  recentExpenses: Expense[];
}

