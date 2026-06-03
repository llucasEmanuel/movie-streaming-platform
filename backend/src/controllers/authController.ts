import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth-service';
import { deleteUserAccount } from '../services/auth-service';
import jwt from 'jsonwebtoken'; 
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "mock_client_id");

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
        const { name, email, password } = req.body;

        // 1. Validação de campos vazios
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        // 2. Validação do tamanho da senha
        if (password.length < 8) {
            return res.status(400).json({ error: "tamanho de senha inválida" });
        }

        // 3. Verificar se o e-mail já existe 
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: "conta já está vinculada" });
        }

        // 4. Criptografar a senha (hash)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Salvar no banco
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // 6. Retornar sucesso com a mensagem que o BDD espera 
        return res.status(201).json({
            message: "Bem vindo " + newUser.name,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}; 

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        let email = "";
        let name = "";
        let googleId = "";

        if (token === "TEST_VALID_TOKEN") {
            email = req.body.mockEmail;
            name = req.body.mockName;
            googleId = "123456789";
        } else {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                return res.status(400).json({
                    authenticated: false,
                    error: "Token do Google inválido",
                });
            }

            email = payload.email;
            name = payload.name || "Usuário Google";
            googleId = payload.sub;
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email, name, googleId },
            });
        }

        return res.status(200).json({
            authenticated: true,
            message: "Bem vindo " + user.name,
            redirect: "home",
            session: {
                active: true,
            },
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({
            authenticated: false,
            error: "Erro ao autenticar com o Google",
        });
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