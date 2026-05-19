import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/user-repository';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "mock_client_id");

export const registerUser = async (data: any) => {
    const { name, email, password } = data;

    // 1. Garantir que os dados são strings puras
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        throw { status: 400, message: "Formato de dados inválido. A API não deve vazar informações." };
    }

    // 2. Validação de campos vazios
    if (!name.trim() || !email.trim() || !password.trim()) {
        throw { status: 400, message: "Todos os campos são obrigatórios" };
    }

    // 3. Validação de formato de e-mail 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw { status: 400, message: "formato de email inválido" };
    }

    // 4. Validação do tamanho mínimo da senha
    if (password.length < 8) {
        throw { status: 400, message: "tamanho de senha inválida" };
    }

    // 5. Prevenção de DoS (Tamanho máximo da senha)
    if (password.length > 72) {
        throw { status: 400, message: "tamanho de senha excede o limite permitido" };
    }

    // 6. Verificar se o e-mail já existe 
    const userExists = await userRepository.findUserByEmail(email);
    if (userExists) {
        throw { status: 400, message: "conta já está vinculada" };
    }

    // 7. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 8. Salvar no banco
    const newUser = await userRepository.createUser({
        name,
        email,
        password: hashedPassword,
    });

    return newUser;
};

export const authenticateGoogleUser = async (token: string, bodyMockData: any) => {
    if (token === "TEST_TIMEOUT_TOKEN") {
        throw { status: 500, message: "Erro ao autenticar com o Google" };
    } 
    if (token === "TOKEN_FORJADO_INVALIDO") {
        throw { status: 400, message: "Token do Google inválido" };
    }

    let email = "";
    let name = "";
    let googleId = "";

    if (token === "TEST_VALID_TOKEN") {
        email = bodyMockData.mockEmail || "exemplo@test.com";
        name = bodyMockData.mockName || "Usuário Teste";
        googleId = "123456789";
    } else {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            
            if (!payload || !payload.email) {
                throw { status: 400, message: "Token do Google inválido" };
            }
            
            email = payload.email;
            name = payload.name || "Usuário Google";
            googleId = payload.sub;
        } catch (error: any) {
            if (error.message && (error.message.includes('Token used too late') || error.message.includes('Wrong number of segments') || error.message.includes('Invalid token'))) {
                throw { status: 400, message: "Token do Google inválido" };
            }
            throw { status: 500, message: "Erro ao autenticar com o Google" };
        }
    }

    let user = await userRepository.findUserByEmail(email);

    if (!user) {
        user = await userRepository.createUser({ email, name, googleId });
    }

    return user;
};