import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient(); // Objeto utilizado para nos comunicarmos com o BD via "POO"

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