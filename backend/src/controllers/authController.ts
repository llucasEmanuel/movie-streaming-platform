import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth-service';
import { deleteUserAccount } from '../services/auth-service';
import jwt from 'jsonwebtoken'; 

export const checkAuthToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Token de acesso não fornecido" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        (req as any).user = decoded; 
        
        next(); 
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
};

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

export const deleteMe = async (req: Request, res: Response): Promise<Response | any> => {
    try {
        const userId = (req as any).user.id; 
        const targetUserId = req.params.id; // Verifica se tem algum ID na URL

        if (targetUserId && targetUserId !== userId) {
            return res.status(403).json({ error: "Você não tem permissão para realizar esta ação" });
        }

        await deleteUserAccount(userId);
        
        return res.status(204).send();
        
    } catch (error: any) {
        if (error.message === 'Usuário não encontrado.') {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro interno no servidor ao tentar excluir conta.' });
    }
};