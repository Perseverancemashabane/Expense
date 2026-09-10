import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password-by-id', authController.resetPasswordById);
router.get('/me', authController.me);

export default router;

