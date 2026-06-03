import { Router } from "express";
import { login } from "../controllers/user_login-controller";

export const userLoginRouter = Router();

userLoginRouter.post("/login", login);