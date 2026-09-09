import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/summary', analyticsController.getSummary);

export default router;

