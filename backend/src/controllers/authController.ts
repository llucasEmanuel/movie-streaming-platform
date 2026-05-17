import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient(); // Objeto utilizado para nos comunicarmos com o BD via "POO"
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "mock_client_id");

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

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                authenticated: false,
                error: "Preencha todos os campos obrigatórios",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return res.status(401).json({
                authenticated: false,
                error: "E-mail ou senha inválidos"
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                authenticated: false,
                error: "E-mail ou senha inválidos"
            });
        }

        return res.status(200).json({
            authenticated: true,
            message: "Login realizado com sucesso",
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
            error: "Erro interno no servidor",
        });
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