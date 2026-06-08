import "dotenv/config";
import { Before, Given, Then, When } from "@cucumber/cucumber";
import { PrismaClient } from "../../src/generated/prisma";
import assert from "assert";
import axios from "axios";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const api = axios.create({
    baseURL: "http://localhost:3000",
    validateStatus: () => true,
});

let response: any;
let currentEmail = "";

const googleTestId = "123456789";

const testEmails = [
    "alvaro@teste.com",
    "recife@teste.com",
    "usuario_inexistente@teste.com",
];

Before(async () => {
    await prisma.user.deleteMany({
        where: {
            OR: [
                {
                    email: {
                        in: testEmails,
                    },
                },
                {
                    googleId: googleTestId,
                },
            ],
        },
    });

    response = undefined;
    currentEmail = "";
});

Given(
    "existe uma conta ativa cadastrada com o e-mail {string}",
    async function (email: string) {
        currentEmail = email;

        const temporaryPassword = await bcrypt.hash("temporary-password", 10);

        await prisma.user.upsert({
            where: { email },
            update: {
                name: "Usuário de Teste",
                password: temporaryPassword,
                googleId: null,
            },
            create: {
                email,
                name: "Usuário de Teste",
                password: temporaryPassword,
            },
        });
    }
);

Given(
    "a senha cadastrada para essa conta é {string}",
    async function (password: string) {
        assert.ok(currentEmail, "Nenhum e-mail foi definido antes da senha.");

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email: currentEmail },
            data: {
                password: hashedPassword,
            },
        });
    }
);

Given(
    "não existe uma conta cadastrada com o e-mail {string}",
    async function (email: string) {
        await prisma.user.deleteMany({
            where: { email },
        });

        const user = await prisma.user.findUnique({
            where: { email },
        });

        assert.strictEqual(user, null);
    }
);

Given(
    "existe uma conta ativa vinculada ao e-mail {string}",
    async function (email: string) {
        currentEmail = email;

        await prisma.user.upsert({
            where: { email },
            update: {
                name: "Usuário Google",
                password: null,
                googleId: googleTestId,
            },
            create: {
                email,
                name: "Usuário Google",
                googleId: googleTestId,
            },
        });
    }
);

Given(
    "o e-mail {string} está associado a uma conta Google válida",
    async function (email: string) {
        currentEmail = email;

        await prisma.user.update({
            where: { email },
            data: {
                googleId: googleTestId,
            },
        });
    }
);

When(
    "uma tentativa de login for realizada com o e-mail {string} e senha {string}",
    async function (email: string, password: string) {
        response = await api.post("/api/login", {
            email,
            password,
        });
    }
);

When(
    "uma tentativa de login for realizada com e-mail vazio e senha vazia",
    async function () {
        response = await api.post("/api/login", {
            email: "",
            password: "",
        });
    }
);

When(
    "uma tentativa de login via Google for realizada para o e-mail {string}",
    async function (email: string) {
        currentEmail = email;

        response = await api.post("/api/auth/google", {
            token: "TEST_VALID_TOKEN",
            mockEmail: email,
            mockName: "Usuário Google",
        });
    }
);

Then("o serviço deve autenticar o usuário", function () {
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.authenticated, true);
});

Then("o serviço não deve autenticar o usuário", function () {
    assert.ok(response.status === 400 || response.status === 401);
    assert.notStrictEqual(response.data.authenticated, true);
});

Then("o serviço não deve processar a autenticação", function () {
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.authenticated, false);
});

Then("o serviço deve manter a sessão do usuário ativa", function () {
    assert.strictEqual(response.data.session.active, true);
});

Then("o serviço deve liberar o acesso à plataforma", function () {
    assert.strictEqual(response.data.redirect, "home");
});

Then("o serviço deve informar a mensagem {string}", function (message: string) {
    const responseBody = JSON.stringify(response.data);

    assert.ok(
        responseBody.includes(message),
        `Mensagem esperada não encontrada.
Esperado: ${message}
Recebido: ${responseBody}`
    );
});