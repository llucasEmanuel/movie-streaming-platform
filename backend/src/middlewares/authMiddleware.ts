import { Request, Response, NextFunction } from "express";
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

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // Abordagem A: Confia no campo 'role' contido dentro do token JWT
    if (!user || user.role !== 'administrador') {
        return res.status(403).json({ message: "Acesso negado. Privilégios de administrador necessários." });
    }

    next();
};
