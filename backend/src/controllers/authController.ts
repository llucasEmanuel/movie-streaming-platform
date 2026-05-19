import { Request, Response } from "express";
import * as authService from '../services/auth-service';

export const register = async (req: Request, res: Response) => { 
    try {
        const newUser = await authService.registerUser(req.body);

        return res.status(201).json({
            message: "Bem vindo " + newUser.name,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        
        const user = await authService.authenticateGoogleUser(token, req.body);

        return res.status(200).json({
            message: "Bem vindo " + user.name,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error: any) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};