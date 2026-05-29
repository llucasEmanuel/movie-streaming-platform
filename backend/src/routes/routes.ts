import { Router } from 'express';
import { register, googleAuth } from '../controllers/authController'; 

const router = Router();

router.post('/register', register);
router.post('/auth/google', googleAuth);

export default router;