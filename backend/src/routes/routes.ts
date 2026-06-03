import { Router } from 'express';
import { userLoginRouter } from './user_login-routes';
import { register, googleLogin, deleteMe, checkAuthToken } from '../controllers/authController';

const router = Router();

// Rotas de Autenticação
router.post('/register', register);
router.post('/auth/google', googleLogin);

router.use(userLoginRouter);

// Rotas de Usuário
router.delete('/users/me', checkAuthToken, deleteMe);
router.delete('/users/:id', checkAuthToken, deleteMe);

export default router;
