import { Request, Response } from "express";
import { UserLoginService } from "../services/user_login-service";

const userLoginService = new UserLoginService();

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await userLoginService.login(email, password);

        return res.status(result.status).json(result.body);
    } catch (error) {
        return res.status(500).json({
            authenticated: false,
            error: "Erro interno no servidor",
        });
    }
};