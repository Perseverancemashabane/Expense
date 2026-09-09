import { Request, Response } from 'express';
import { db } from '../config/db';

export const analyticsController = {
  // GET /api/analytics/summary?month=YYYY-MM
  async getSummary(req: Request, res: Response) {
    try {
      const month = (req.query.month as string) || '2026-09';
      const [yearStr, monthStr] = month.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      const lastDay = new Date(y, m, 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

      // 1. Budget record
      let budgetRecord = await db.budgets.getByMonth(month);
      if (!budgetRecord) {
        budgetRecord = await db.budgets.upsert(month, 3500, 'Student Monthly Budget');
      }
      const budgetAmount = Number(budgetRecord.amount);

      // 2. Expenses for month
      const expenses = await db.expenses.getAll({ startDate, endDate });
      const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const remainingBudget = budgetAmount - totalSpent;
      const percentageSpent = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

      // 3. Daily trend data
      const dailyMap = new Map<string, number>();
      for (let day = 1; day <= lastDay; day++) {
        const dayKey = `${month}-${String(day).padStart(2, '0')}`;
        dailyMap.set(dayKey, 0);
      }
      for (const e of expenses) {
        if (dailyMap.has(e.date)) {
          dailyMap.set(e.date, (dailyMap.get(e.date) || 0) + Number(e.amount));
        }
      }
      const dailyTrend = Array.from(dailyMap.entries()).map(([date, amount]) => ({
        date,
        day: parseInt(date.split('-')[2], 10),
        amount: Math.round(amount * 100) / 100,
      }));

      // 4. Category breakdown
      const categories = await db.categories.getAll();
      const categoryBreakdown = categories.map((cat: any) => {
        const catExpenses = expenses.filter(
          (e) => e.category_name.toLowerCase() === cat.name.toLowerCase() || e.category_id === cat.id
        );
        const catSpent = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const percentage = totalSpent > 0 ? (catSpent / totalSpent) * 100 : 0;

        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          allocated_budget: Number(cat.allocated_budget || 0),
          total_spent: Math.round(catSpent * 100) / 100,
          percentage: Math.round(percentage * 10) / 10,
          count: catExpenses.length,
        };
      }).filter((c: any) => c.total_spent > 0 || c.allocated_budget > 0);

      // 5. Payment method breakdown
      const paymentMethodsMap: Record<string, number> = {};
      for (const e of expenses) {
        const pm = e.payment_method || 'Cash';
        paymentMethodsMap[pm] = (paymentMethodsMap[pm] || 0) + Number(e.amount);
      }
      const paymentMethods = Object.entries(paymentMethodsMap).map(([method, amount]) => ({
        method,
        amount: Math.round(amount * 100) / 100,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 1000) / 10 : 0,
      }));

      // 6. Student Advice & Health
      let healthStatus: 'healthy' | 'warning' | 'danger' = 'healthy';
      let insightMessage = 'Your spending is well within your monthly student budget limit.';

      if (percentageSpent >= 100) {
        healthStatus = 'danger';
        insightMessage = `You have exceeded your monthly allowance by R ${Math.abs(remainingBudget).toFixed(2)}. Pause non-essential purchases.`;
      } else if (percentageSpent >= 80) {
        healthStatus = 'warning';
        insightMessage = `You have utilized ${percentageSpent.toFixed(1)}% of your monthly allowance. Exercise caution for the rest of the month.`;
      } else {
        insightMessage = `Great financial discipline! You still have R ${remainingBudget.toFixed(2)} available.`;
      }

      return res.json({
        success: true,
        month,
        budget: {
          amount: budgetAmount,
          total_spent: Math.round(totalSpent * 100) / 100,
          remaining: Math.round(remainingBudget * 100) / 100,
          percentage_spent: Math.round(percentageSpent * 10) / 10,
          healthStatus,
          insightMessage,
        },
        categoryBreakdown,
        dailyTrend,
        paymentMethods,
        recentExpenses: expenses.slice(0, 5),
      });
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch analytics' });
    }
  },
};
