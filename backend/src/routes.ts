import { Router } from "express";
import { register, googleLogin } from "./controllers/authController";
import { userLoginRouter } from "./routes/user_login-routes";

const router = Router();

router.post("/register", register);
router.post("/auth/google", googleLogin);

router.use(userLoginRouter);

export default router;