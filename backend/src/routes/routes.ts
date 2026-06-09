import { Router } from 'express';
import { userLoginRouter } from './user_login-routes';
import { register, googleLogin, deleteMe, verifyEmail } from '../controllers/authController';
import {  checkAuthToken } from '../middlewares/authMiddleware';

const router = Router();

// Rotas de Autenticação
router.post('/register', register);
router.post('/auth/google', googleLogin);
router.post('/verify-email', verifyEmail);
router.use(userLoginRouter);

router.use(userLoginRouter);

router.delete("/users/me", checkAuthToken, deleteMe);

export default router;