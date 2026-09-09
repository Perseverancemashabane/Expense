import { Request, Response } from 'express';
import { db } from '../config/db';
import { CategorySummary } from '../types';

export const categoryController = {
  // GET /api/categories?month=YYYY-MM
  async getAllCategories(req: Request, res: Response) {
    try {
      const month = (req.query.month as string) || '2026-09';
      const categories = await db.categories.getAll();

      // Fetch expenses for the month to calculate category breakdown
      const [yearStr, monthStr] = month.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      const lastDay = new Date(y, m, 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

      const expenses = await db.expenses.getAll({ startDate, endDate });
      const totalMonthSpend = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      const summaries: CategorySummary[] = categories.map((cat: any) => {
        const catExpenses = expenses.filter(
          (e) => e.category_name.toLowerCase() === cat.name.toLowerCase() || e.category_id === cat.id
        );
        const totalSpent = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const percentage = totalMonthSpend > 0 ? (totalSpent / totalMonthSpend) * 100 : 0;

        return {
          category_id: cat.id,
          category_name: cat.name,
          icon: cat.icon,
          color: cat.color,
          allocated_budget: Number(cat.allocated_budget || 0),
          total_spent: Math.round(totalSpent * 100) / 100,
          expense_count: catExpenses.length,
          percentage_of_total_spent: Math.round(percentage * 10) / 10,
        };
      });

      return res.json({
        success: true,
        month,
        totalMonthSpend: Math.round(totalMonthSpend * 100) / 100,
        data: summaries,
      });
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch categories' });
    }
  },
};

