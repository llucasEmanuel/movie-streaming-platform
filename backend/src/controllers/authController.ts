import { Request, Response} from "express";
import * as authService from '../services/auth-service';
import { deleteUserAccount } from '../services/auth-service';
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "mock_client_id");

export const register = async (req: Request, res: Response) => { 
    try {
        const { name, email, password } = req.body;

        const newUser = await authService.registerUser({ name, email, password });

        return res.status(201).json({
            message: "Bem vindo " + newUser.name,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message || "Erro interno" });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        const user = await authService.authenticateGoogleUser(token, req.body);

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

    } catch (error: any) {
        const statusCode = error.status || 500;
        const errorMessage = error.message || "Erro ao autenticar com o Google";

        return res.status(statusCode).json({
            authenticated: false,
            error: errorMessage,
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

export const verifyEmail = async (req: Request, res: Response): Promise<Response | any> => {
    try {
        const { email, code } = req.body;

        // Validação básica se o frontend mandou os dados corretos
        if (!email || !code) {
            return res.status(400).json({ error: "E-mail e código são obrigatórios." });
        }

        // Chama o serviço que acabámos de criar
        await authService.verifyUserEmail(email, code);

        return res.status(200).json({ 
            message: "Conta ativada com sucesso! Você já pode fazer login." 
        });

    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message || "Erro interno ao validar e-mail" });
    }
};

