import { Request, Response } from 'express';
import { db } from '../config/db';
import { BudgetSummary } from '../types';

function getStudentNumber(req: Request): string {
  const fromHeader = req.headers['x-student-id'] as string;
  const fromQuery = req.query.student_number as string;
  const fromBody = req.body?.student_number as string;
  return (fromHeader || fromQuery || fromBody || '230099774').trim();
}

export const budgetController = {
  // GET /api/budget/current or GET /api/budget?month=YYYY-MM
  async getCurrentBudget(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const monthQuery = (req.query.month as string) || '2026-09';
      const [yearStr, monthStr] = monthQuery.split('-');
      const year = parseInt(yearStr, 10) || 2026;
      const monthNum = parseInt(monthStr, 10) || 9;

      // 1. Fetch budget record for this student
      let budgetRecord = await db.budgets.getByMonth(monthQuery, studentNumber);
      if (!budgetRecord) {
        // Look up student allowance
        const student = await db.students.findByStudentNumber(studentNumber);
        const allowance = student ? Number(student.monthly_allowance) : 3500;
        budgetRecord = await db.budgets.upsert(monthQuery, allowance, 'Student Monthly Allowance', studentNumber);
      }

      const budgetAmount = Number(budgetRecord.amount);

      // 2. Fetch expenses for this student and this month
      const startOfMonth = `${monthQuery}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endOfMonth = `${monthQuery}-${String(lastDay).padStart(2, '0')}`;

      const expenses = await db.expenses.getAll({
        studentNumber,
        startDate: startOfMonth,
        endDate: endOfMonth,
      });

      const totalSpent = expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      const remainingBudget = budgetAmount - totalSpent;
      const percentageSpent = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

      // Determine budget health status
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (percentageSpent >= 100) {
        status = 'danger';
      } else if (percentageSpent >= 80) {
        status = 'warning';
      }

      // Compute day metrics
      const now = new Date('2026-09-09T12:00:00Z'); // Local context time anchor
      let currentDay = now.getDate();
      // If querying a past or future month, clamp appropriately
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (monthQuery < currentYearMonth) {
        currentDay = lastDay;
      } else if (monthQuery > currentYearMonth) {
        currentDay = 1;
      }

      const daysInMonth = lastDay;
      const daysElapsed = Math.min(daysInMonth, Math.max(1, currentDay));
      const daysRemaining = Math.max(1, daysInMonth - daysElapsed + 1);

      const dailyBurnRate = totalSpent / daysElapsed;
      const recommendedDailyBudget = Math.max(0, remainingBudget / daysRemaining);

      const summary: BudgetSummary = {
        month: monthQuery,
        budget_amount: budgetAmount,
        total_spent: Math.round(totalSpent * 100) / 100,
        remaining_budget: Math.round(remainingBudget * 100) / 100,
        percentage_spent: Math.round(percentageSpent * 10) / 10,
        status,
        days_in_month: daysInMonth,
        days_elapsed: daysElapsed,
        days_remaining: daysRemaining,
        daily_burn_rate: Math.round(dailyBurnRate * 100) / 100,
        recommended_daily_budget: Math.round(recommendedDailyBudget * 100) / 100,
      };

      return res.json({
        success: true,
        data: {
          budget: budgetRecord,
          summary,
        },
      });
    } catch (err: any) {
      console.error('Error fetching budget summary:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch budget' });
    }
  },

  // POST /api/budget
  async setBudget(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const { month, amount, notes } = req.body;

      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ success: false, error: 'Valid month in YYYY-MM format is required' });
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ success: false, error: 'Valid positive budget amount is required' });
      }

      const updatedBudget = await db.budgets.upsert(month, parsedAmount, notes || '', studentNumber);
      return res.json({
        success: true,
        message: 'Budget updated successfully',
        data: updatedBudget,
      });
    } catch (err: any) {
      console.error('Error setting budget:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to set budget' });
    }
  },
};


