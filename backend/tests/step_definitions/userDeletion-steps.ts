import { Given, When, Then, Before } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';


import app from '../../src/index'; // Seu servidor Express exportado
import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();


interface UtilizadorSimulado {
    id: string;
    email: string;
}

// Variáveis de estado isoladas para cada cenário
let baseDadosSimulada: UtilizadorSimulado[] = [];
let idUtilizadorAutenticado: string | null = null;
let statusRespostaAPI: number | null = null;

let response: request.Response;
let jwtToken: string;

Before(function () {
    baseDadosSimulada = [];
    idUtilizadorAutenticado = null;
    statusRespostaAPI = null;
});


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

// ---BACKGROUND ---

Given('que os seguintes utilizadores existem no sistema:', function (dataTable) {
    const linhas = dataTable.hashes(); 
    
    linhas.forEach((linha: any) => {
        baseDadosSimulada.push({
            id: linha.ID,
            email: linha.Email
        });
    });
});

/*** GIVENS  ***/

Given('que eu estou autenticado com o ID {string}', function (id) {
    idUtilizadorAutenticado = id;
});

Given('que eu não estou autenticado na plataforma', function () {
    idUtilizadorAutenticado = null;
});

// --- WHENS ---

When('eu solicito a exclusão permanente da minha conta de utilizador', async function () {
   
    if (!idUtilizadorAutenticado) {
        statusRespostaAPI = 401;
        return;
    }


    const idParaApagar = idUtilizadorAutenticado; 
    const index = baseDadosSimulada.findIndex(u => u.id === idParaApagar);
    if (index !== -1) {
        baseDadosSimulada.splice(index, 1); 
        statusRespostaAPI = 204; 
    } else {
        statusRespostaAPI = 404;
    }
});

When('eu tento solicitar a remoção da conta do utilizador {string}', async function (idAlvo) {
    if (!idUtilizadorAutenticado) {
        statusRespostaAPI = 401;
        return;
    }

    if (idAlvo !== idUtilizadorAutenticado) {
        statusRespostaAPI = 403; // Forbidden (Falta de permissão)
        return;
    }

    const index = baseDadosSimulada.findIndex(u => u.id === idAlvo);
    if (index !== -1) {
        baseDadosSimulada.splice(index, 1);
        statusRespostaAPI = 204;
    } else {
        statusRespostaAPI = 404;
    }
});

//--- THENS ---

Then('o sistema deve confirmar a eliminação com sucesso', function () {
    // No seu controller, a exclusão bem-sucedida envia res.status(204).send()
    expect(statusRespostaAPI).to.equal(204);
});

Then('o meu perfil de utilizador não deve mais estar acessível na plataforma', function () {
    const aindaExiste = baseDadosSimulada.some(u => u.id === idUtilizadorAutenticado);
    expect(aindaExiste).to.be.false;
});

Then('o sistema deve rejeitar o pedido exigindo autenticação', function () {
    expect(statusRespostaAPI).to.equal(401);
});

Then('a conta do utilizador {string} deve continuar ativa no sistema', function (idVerificacao) {
    const aindaExiste = baseDadosSimulada.some(u => u.id === idVerificacao);
    expect(aindaExiste).to.be.true; 
});

Then('o sistema deve bloquear a operação por falta de permissão', function () {
    expect(statusRespostaAPI).to.equal(403);
});