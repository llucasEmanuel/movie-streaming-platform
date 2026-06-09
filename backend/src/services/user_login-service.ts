import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserLoginRepository } from "../repositories/user_login-repository";

const userLoginRepository = new UserLoginRepository();

export class UserLoginService {
    async login(email: string, password: string) {
        if (!email || !password) {
            return {
                status: 400,
                body: {
                    authenticated: false,
                    error: "Preencha todos os campos obrigatórios",
                },
            };
        }

        const user = await userLoginRepository.findByEmail(email);

        if (!user || !user.password) {
            return {
                status: 401,
                body: {
                    authenticated: false,
                    error: "E-mail ou senha inválidos",
                },
            };
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return {
                status: 401,
                body: {
                    authenticated: false,
                    error: "E-mail ou senha inválidos",
                },
            };
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        return {
            status: 200,
            body: {
                authenticated: true,
                message: "Login realizado com sucesso",
                redirect: "home",
                token: token,
                session: {
                    active: true,
                },
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        };
    }
}