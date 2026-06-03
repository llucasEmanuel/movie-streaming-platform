import bcrypt from "bcrypt";
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

        return {
            status: 200,
            body: {
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
            },
        };
    }
}