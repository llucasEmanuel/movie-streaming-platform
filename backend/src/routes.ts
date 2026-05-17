import { Router } from 'express';
import { register, login, googleLogin } from './controllers/authController'; 

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/auth/google', googleLogin);

export default router;