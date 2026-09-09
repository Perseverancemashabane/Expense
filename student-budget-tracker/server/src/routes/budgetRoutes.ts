import { Router } from 'express';
import { budgetController } from '../controllers/budgetController';

const router = Router();

router.get('/current', budgetController.getCurrentBudget);
router.get('/', budgetController.getCurrentBudget);
router.post('/', budgetController.setBudget);

export default router;

