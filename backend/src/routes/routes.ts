import { Router } from 'express';
import { register, googleLogin } from '../controllers/authController'; 

const router = Router();

router.post('/register', register);
router.post('/auth/google', googleLogin);

export default router;