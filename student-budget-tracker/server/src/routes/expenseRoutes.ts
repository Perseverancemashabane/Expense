import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';

const router = Router();

router.get('/', expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpenseById);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;

