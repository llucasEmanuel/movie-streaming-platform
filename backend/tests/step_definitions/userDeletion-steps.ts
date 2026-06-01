import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import jwt from 'jsonwebtoken';

// IMPORTANTE: Ajuste o caminho das importações abaixo para a estrutura real do seu projeto!
import app from '../../src/index'; // Seu servidor Express exportado
import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

// Variáveis globais para compartilhar dados entre os passos do cenário
let response: request.Response;
let jwtToken: string;

Given('existe uma conta ativa cadastrada com o e-mail {string} e ID {string}', async function (email: string, id: string) {
    await prisma.user.deleteMany({ where: { email } });
    
    await prisma.user.create({
        data: {
            id: id,
            email: email,
            name: "Usuário Teste",
            password: "hashed_password" 
        }
    });
});

Given('que o usuário {string} com ID {string} existe no banco de dados', async function (email: string, id: string) {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.user.create({
        data: { id, email, name: "Hacker", password: "hashed_password" }
    });
});

Given('que a API está em funcionamento', function () {
});

Given('que eu possuo um Token de Autenticação JWT válido para o usuário {string}', function (id: string) {
    const secret = process.env.JWT_SECRET || 'secret';
    jwtToken = jwt.sign({ id }, secret, { expiresIn: '1h' });
});

Given('que eu não adiciono nenhum Token de Autenticação no cabeçalho da requisição', function () {
    jwtToken = ''; // Limpa o token
});

When('eu envio uma requisição {string} para o endpoint {string} com o Token no cabeçalho', async function (metodo: string, endpoint: string) {
    response = await request(app)
        .delete(endpoint)
        .set('Authorization', `Bearer ${jwtToken}`);
});

When('eu envio uma requisição {string} para o endpoint {string}', async function (metodo: string, endpoint: string) {
    response = await request(app).delete(endpoint);
});

When('eu envio uma requisição {string} para o endpoint {string} com o Token do hacker no cabeçalho', async function (metodo: string, endpoint: string) {
    response = await request(app)
        .delete(endpoint)
        .set('Authorization', `Bearer ${jwtToken}`);
});

Then('o código de status HTTP da resposta deve ser {int}', function (statusCode: number) {
    assert.strictEqual(response.status, statusCode, `Esperava status ${statusCode}, mas recebeu ${response.status}. Corpo: ${JSON.stringify(response.body)}`);
});

Then('o corpo da resposta em JSON deve conter a mensagem de erro {string}', function (mensagem: string) {
    assert.strictEqual(response.body.error, mensagem);
});

Then('o corpo da resposta em JSON deve conter a mensagem {string}', function (mensagem: string) {
    assert.strictEqual(response.body.error || response.body.message, mensagem);
});

Then('o usuário com ID {string} não deve mais ser encontrado no banco de dados', async function (id: string) {
    const userInDb = await prisma.user.findUnique({ where: { id } });
    assert.strictEqual(userInDb, null, "O usuário deveria ter sido deletado, mas ainda está no banco.");
});

Then('a conta do usuário {string} deve continuar ativa no sistema', async function (email: string) {
    const userInDb = await prisma.user.findUnique({ where: { email } });
    assert.notStrictEqual(userInDb, null, "O usuário deveria continuar no banco, mas não foi encontrado.");
});

Then('a conta do usuário deve continuar ativa no sistema', async function () {
    const userInDb = await prisma.user.findFirst({ where: { email: "Luiz@teste.com" } });
    assert.notStrictEqual(userInDb, null, "O usuário deveria continuar no banco, mas não foi encontrado.");
});

Given('que o usuário está autenticado no sistema web', function () { return 'pending'; });
Given('que o usuário está na página de {string}', function (string) { return 'pending'; });
When('o usuário clica no botão {string}', function (string) { return 'pending'; });
When('o sistema exibe um modal solicitando a digitação da frase {string}', function (string) { return 'pending'; });
When('o usuário digita {string} no campo de confirmação', function (string) { return 'pending'; });
Then('o sistema deve redirecionar o usuário para a página inicial deslogada', function () { return 'pending'; });
Then('o sistema deve exibir a mensagem de sucesso {string}', function (string) { return 'pending'; });
Then('o usuário não deve mais ter acesso ao sistema com o e-mail {string}', function (string) { return 'pending'; });
Then('o modal de confirmação deve ser fechado', function () { return 'pending'; });
Then('o usuário deve permanecer na página de {string}', function (string) { return 'pending'; });
Then('o sistema deve exibir a mensagem de erro {string}', function (string) { return 'pending'; });
Then('o modal de confirmação deve permanecer aberto', function () { return 'pending'; });
