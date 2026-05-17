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

let loginData: Record<string, string> = {};
let response: any;
let currentEmail = "";

const testEmails = [
    "alvaro@teste.com",
    "recife@teste.com",
    "usuario_inexistente@teste.com",
];

Before(async () => {
    await prisma.user.deleteMany({
        where: {
            email: {
                in: testEmails,
            },
        },
    });

    loginData = {};
    response = undefined;
    currentEmail = "";
});

Given("eu estou na tela de login", function () {
    loginData = {};
    response = undefined;
});

Given(
    "existe uma conta ativa cadastrada com o e-mail {string}",
    async function (email: string) {
        currentEmail = email;

        const hashedPassword = await bcrypt.hash("Senha@123", 10);

        await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
            },
            create: {
                email,
                name: "Usuário de Teste",
                password: hashedPassword,
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
                googleId: "123456789",
            },
            create: {
                email,
                name: "Usuário Google",
                googleId: "123456789",
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
                googleId: "123456789",
            },
        });
    }
);

When(
    "eu preencho o campo de login {string} com {string}",
    function (field: string, value: string) {
        const fieldsMap: Record<string, string> = {
            "e-mail": "email",
            email: "email",
            senha: "password",
        };

        const fieldName = fieldsMap[field] || field;
        loginData[fieldName] = value;
    }
);

When("eu seleciono a opção de login {string}", async function (option: string) {
    if (option === "Entrar") {
        response = await api.post("/login", loginData);
    }

    if (option === "Entrar com Google") {
        response = undefined;
    }
});

When("concluo a autenticação pela conta Google", async function () {
    response = await api.post("/auth/google", {
        token: "TEST_VALID_TOKEN",
        mockEmail: currentEmail,
        mockName: "Usuário Google",
    });
});

Then("o sistema deve autenticar o usuário", function () {
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.authenticated, true);
});

Then("o sistema não deve autenticar o usuário", function () {
    assert.ok(response.status === 400 || response.status === 401);
    assert.notStrictEqual(response.data.authenticated, true);
});

Then("o sistema não deve enviar a tentativa de autenticação", function () {
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.authenticated, false);
});

Then("deve exibir a mensagem {string}", function (message: string) {
    const responseBody = JSON.stringify(response.data);

    assert.ok(
        responseBody.includes(message),
        `Mensagem esperada não encontrada.
Esperado: ${message}
Recebido: ${responseBody}`
    );
});

Then("a página principal da plataforma deve ser exibida", function () {
    assert.strictEqual(response.data.redirect, "home");
});

Then("a sessão do usuário deve permanecer ativa", function () {
    assert.strictEqual(response.data.session.active, true);
});

Then("a tela de login deve continuar sendo exibida", function () {
    assert.ok(response.status === 400 || response.status === 401);
});