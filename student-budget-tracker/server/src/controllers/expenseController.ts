import { Request, Response } from 'express';
import { db } from '../config/db';

function getStudentNumber(req: Request): string {
  const fromHeader = req.headers['x-student-id'] as string;
  const fromQuery = req.query.student_number as string;
  const fromBody = req.body?.student_number as string;
  return (fromHeader || fromQuery || fromBody || '230099774').trim();
}

export const expenseController = {
  // GET /api/expenses
  async getAllExpenses(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const { category, startDate, endDate, search, sortBy, sortOrder, month } = req.query;

      let effectiveStart = startDate as string | undefined;
      let effectiveEnd = endDate as string | undefined;

      // If month is provided, set start and end date of that month
      if (month && typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
        const [yearStr, monthStr] = month.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10);
        const lastDay = new Date(y, m, 0).getDate();
        if (!effectiveStart) effectiveStart = `${month}-01`;
        if (!effectiveEnd) effectiveEnd = `${month}-${String(lastDay).padStart(2, '0')}`;
      }

      const expenses = await db.expenses.getAll({
        studentNumber,
        category: category as string,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      });

      const totalAmount = expenses.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

      return res.json({
        success: true,
        count: expenses.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        data: expenses,
      });
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch expenses' });
    }
  },

  // GET /api/expenses/:id
  async getExpenseById(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid expense ID' });
      }

      const expense = await db.expenses.getById(id, studentNumber);
      if (!expense) {
        return res.status(404).json({ success: false, error: 'Expense not found' });
      }

      return res.json({ success: true, data: expense });
    } catch (err: any) {
      console.error('Error fetching expense by ID:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch expense' });
    }
  },

  // POST /api/expenses
  async createExpense(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const { title, amount, category_name, category_id, date, notes, payment_method } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Expense title is required' });
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid positive expense amount is required' });
      }

      if (!category_name || typeof category_name !== 'string') {
        return res.status(400).json({ success: false, error: 'Category name is required' });
      }

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, error: 'Valid date in YYYY-MM-DD format is required' });
      }

      // Find matching category ID if not provided
      let resolvedCategoryId = category_id;
      if (!resolvedCategoryId) {
        const categories = await db.categories.getAll();
        const found = categories.find((c: any) => c.name.toLowerCase() === category_name.toLowerCase());
        if (found) resolvedCategoryId = found.id;
      }

      const newExpense = await db.expenses.create({
        student_number: studentNumber,
        title: title.trim(),
        amount: parsedAmount,
        category_id: resolvedCategoryId || null,
        category_name: category_name.trim(),
        date,
        notes: notes ? String(notes).trim() : '',
        payment_method: payment_method || 'Cash',
      });

      return res.status(201).json({
        success: true,
        message: 'Expense recorded successfully',
        data: newExpense,
      });
    } catch (err: any) {
      console.error('Error creating expense:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to create expense' });
    }
  },

  // PUT /api/expenses/:id
  async updateExpense(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid expense ID' });
      }

      const existing = await db.expenses.getById(id, studentNumber);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Expense not found' });
      }

      const { title, amount, category_name, category_id, date, notes, payment_method } = req.body;
      const updates: any = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          return res.status(400).json({ success: false, error: 'Title cannot be empty' });
        }
        updates.title = title.trim();
      }

      if (amount !== undefined) {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
          return res.status(400).json({ success: false, error: 'Valid positive amount required' });
        }
        updates.amount = parsed;
      }

      if (category_name !== undefined) {
        updates.category_name = String(category_name).trim();
        const categories = await db.categories.getAll();
        const found = categories.find((c: any) => c.name.toLowerCase() === updates.category_name.toLowerCase());
        if (found) updates.category_id = found.id;
      }

      if (category_id !== undefined) updates.category_id = category_id;
      if (date !== undefined) updates.date = date;
      if (notes !== undefined) updates.notes = String(notes).trim();
      if (payment_method !== undefined) updates.payment_method = payment_method;

      const updated = await db.expenses.update(id, updates, studentNumber);

      return res.json({
        success: true,
        message: 'Expense updated successfully',
        data: updated,
      });
    } catch (err: any) {
      console.error('Error updating expense:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to update expense' });
    }
  },

  // DELETE /api/expenses/:id
  async deleteExpense(req: Request, res: Response) {
    try {
      const studentNumber = getStudentNumber(req);
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid expense ID' });
      }

      const deleted = await db.expenses.delete(id, studentNumber);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Expense not found or already deleted' });
      }

      return res.json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to delete expense' });
    }
  },
};


