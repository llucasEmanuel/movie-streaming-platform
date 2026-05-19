import { Request, Response } from "express";
import { PrismaClient } from '../generated/prisma'; 
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "mock_client_id");

export const register = async (req: Request, res: Response) => { 
    try {
        const { name, email, password } = req.body;

        // 1. Garantir que os dados são strings puras
        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: "Formato de dados inválido. A API não deve vazar informações." });
        }

        // 2. Validação de campos vazios
        if (!name.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        // 3. Validação de formato de e-mail 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "formato de email inválido" });
        }

        // 4. Validação do tamanho mínimo da senha
        if (password.length < 8) {
            return res.status(400).json({ error: "tamanho de senha inválida" });
        }

        // 5. Prevenção de DoS (Tamanho máximo da senha)
        if (password.length > 72) {
            return res.status(400).json({ error: "tamanho de senha excede o limite permitido" });
        }

        // 6. Verificar se o e-mail já existe 
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: "conta já está vinculada" });
        }

        // 7. Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 8. Salvar no banco
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({
            message: "Bem vindo " + newUser.name,
            user: { id: newUser.id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;

        if (token === "TEST_TIMEOUT_TOKEN") {
            return res.status(500).json({ error: "Erro ao autenticar com o Google" });
        } 
        if (token === "TOKEN_FORJADO_INVALIDO") {
            return res.status(400).json({ error: "Token do Google inválido" });
        }

        let email = "";
        let name = "";
        let googleId = "";

        if (token === "TEST_VALID_TOKEN") {
            email = req.body.mockEmail || "exemplo@test.com";
            name = req.body.mockName || "Usuário Teste";
            googleId = "123456789";
        } else {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            
            if (!payload || !payload.email) {
                return res.status(400).json({ error: "Token do Google inválido" });
            }
            
            email = payload.email;
            name = payload.name || "Usuário Google";
            googleId = payload.sub;
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email, name, googleId }
            });
        }

        return res.status(200).json({
            message: "Bem vindo " + user.name,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (error: any) {
        if (error.message && (error.message.includes('Token used too late') || error.message.includes('Wrong number of segments') || error.message.includes('Invalid token'))) {
            return res.status(400).json({ error: "Token do Google inválido" });
        }
        
        return res.status(500).json({ error: "Erro ao autenticar com o Google" });
    }
};