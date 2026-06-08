import { Given, When, Then, Before } from "@cucumber/cucumber";
import { PrismaClient } from "../../src/generated/prisma";
import axios from "axios";
import assert from "assert";

const prisma = new PrismaClient();
const api = axios.create({ 
    baseURL: 'http://localhost:3000', 
    validateStatus: () => true 
});

let userData: any = {};
let response: any = null;
let externalServiceStatus = 'online';

Before(async () => {
    await prisma.user.deleteMany({ where: { email: "exemplo@test.com" } });
    userData = {};
    response = null;
});

// --- GIVENS  ---

Given('que eu sou um visitante tentando criar uma conta', function () { return 'passed'; });
Given('eu estou a visualizar o formulário de novos utilizadores', function () { return 'passed'; });
Given('que a plataforma está com as defesas de segurança activas', function () { return 'passed'; });
Given('o sistema valida rigorosamente todas as entradas de dados contra ameaças', function () { return 'passed'; });
Given('eu sou um utilizador que prefere a autenticação social', function () { return 'passed'; });
Given('que a plataforma valida rigorosamente os tokens de provedores externos', function () { return 'passed'; });
Given('eu sou um utilizador tentando aceder a uma área restrita', function () { return 'passed'; });

Given('que o serviço externo do {string} está temporariamente indisponível', function (provedor) {
    externalServiceStatus = 'offline';
});
Given('que eu realizei o pré-registo com o e-mail {string}', async function (email: string) {
    userData.email = email; 
    await prisma.preRegistration.deleteMany({ where: { email } });
    await prisma.user.deleteMany({ where: { email } }); // Garante que não está na base principal
});

Given('os meus dados estão na tabela temporária com o código {string}', async function (codigo: string) {
    await prisma.preRegistration.create({
        data: {
            name: "Usuário Teste",
            email: userData.email,
            password: "hashed_password_mock",
            role: "usuario",
            verificationCode: codigo
        }
    });
});

Given('que o tempo limite da tabela temporária expirou e o meu registo foi limpo', async function () {
    // Apaga da tabela temporária para simular que o cron job ou a lógica de expiração limpou
    await prisma.preRegistration.deleteMany({ where: { email: userData.email } });
});

Given('que a minha conta com o e-mail {string} já se encontra na base de dados principal', async function (email: string) {
    userData.email = email;
    await prisma.user.deleteMany({ where: { email } });
    await prisma.user.create({
        data: {
            name: "Usuário Ativo",
            email: userData.email,
            password: "hashed_password_mock",
            role: "usuario",
            isVerified: true
        }
    });
});

Given('o status da minha conta já está marcado como verificado', async function () {
    const user = await prisma.user.findUnique({ where: { email: userData.email } });
    assert.ok(user, "Usuário não encontrado.");
    assert.strictEqual(user.isVerified, true, "O usuário não está verificado.");
});

Given('que eu iniciei um pré-registo com o e-mail {string}', async function (email: string) {
    userData.email = email;
    await prisma.preRegistration.deleteMany({ where: { email } });
    
    // Guardamos o ID antigo no userData para podermos comparar depois
    const preReg = await prisma.preRegistration.create({
        data: {
            name: "Usuário Indeciso",
            email: userData.email,
            password: "hashed_password_mock",
            role: "usuario",
            verificationCode: "000000" // Código abandonado
        }
    });
    userData.oldPreRegistrationId = preReg.id;
});

Given('eu abandonei o processo antes de inserir o código de verificação', function () {
    // Passo puramente descritivo para fluidez do cenário
});
Given('o tempo limite da tabela temporária expirou e o meu registo foi limpo', async function () {
    // Apaga da tabela temporária para simular que o cron job ou a lógica de expiração limpou
    await prisma.preRegistration.deleteMany({ where: { email: userData.email } });
});

// --- WHENS ---

When('eu tento registar-me fornecendo os dados de teste:', async function (dataTable) {
    const payload: any = {};
    
    for (const row of dataTable.hashes()) {
        let valor = row.Valor || "";

        if (valor === "longa_1000") {
            valor = "a".repeat(1000);
        }

        if (row.Campo === "Nome") payload.name = valor;
        if (row.Campo === "Email") payload.email = valor;
        if (row.Campo === "Senha") payload.password = valor;
    }

    response = await api.post('/api/register', payload);
});

When('um utilizador malicioso tenta registar-se preenchendo o campo de e-mail com o seguinte código:', async function (docString) {
    const jsonInjetado = JSON.parse(docString);
    
    response = await api.post('/api/register', {
        name: "Hacker",
        email: jsonInjetado, 
        password: "senhaSegura123!"
    });
});

When('eu tento enviar uma solicitação de login com o token {string} do provedor {string}', async function (token, provedor) {
    response = await api.post('/api/auth/google', {
        token: token,
        simulateOutage: externalServiceStatus === 'offline' 
    });

    externalServiceStatus = 'online';
});

When('eu envio a solicitação de ativação com o e-mail {string} e o código {string}', async function (email: string, code: string) {
    try {
        response = await api.post('/api/verify-email', { email, code });
    } catch (error: any) {
        response = error.response;
    }
});

When('eu tento registar-me novamente com o mesmo e-mail {string}', async function (email: string) {
    try {
        response = await api.post('/api/register', {
            name: "Usuário Indeciso Retornou",
            email: email,
            password: "Password123*"
        });
    } catch (error: any) {
        response = error.response;
    }
});

When('eu envio uma nova solicitação de ativação com o e-mail {string} e o código {string}', async function (email: string, code: string) {
    try {
        response = await api.post('/api/verify-email', { email, code });
    } catch (error: any) {
        response = error.response;
    }
});

// --- THENS ---

Then('o meu registo deve ser rejeitado pelo sistema', function () {
    assert.ok(
        response?.status >= 400, 
        `O sistema deveria ter rejeitado o registo (status >= 400), mas retornou ${response?.status}`
    );
});

Then('a mensagem de erro deve indicar {string}', function (mensagemEsperada) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    assert.ok(
        corpoResposta.includes(mensagemEsperada),
        `Esperava o erro "${mensagemEsperada}", mas a API retornou: ${corpoResposta}`
    );
});

Then('o sistema deve bloquear a tentativa imediatamente com segurança', function () {
    assert.ok(
        response?.status >= 400, 
        "Alerta Crítico: O sistema não bloqueou a tentativa de injeção NoSQL/SQL!"
    );
});

Then('nenhuma informação ou estrutura interna da base de dados deve ser exposta', function () {
    const respostaString = response?.data ? JSON.stringify(response.data).toLowerCase() : "";
    
    const vazouInfo = respostaString.includes("prisma") || 
                      respostaString.includes("sql") || 
                      respostaString.includes("database") || 
                      respostaString.includes("mongo");
                      
    assert.strictEqual(
        vazouInfo, 
        false, 
        "A aplicação não deve expor detalhes internos da base de dados nas respostas!"
    );
});

Then('a aplicação deve lidar com a falha externa de forma resiliente', function () {
    assert.ok(
        response?.status === 500 || response?.status === 502 || response?.status === 503,
        `A API deveria ter retornado um erro de serviço (5xx), mas retornou ${response?.status}`
    );
});

Then('eu devo ver a mensagem de erro {string}', function (mensagemEsperada) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "Sem resposta";
    assert.ok(
        corpoResposta.includes(mensagemEsperada), 
        `Aviso "${mensagemEsperada}" não foi encontrado.`
    );
});

Then('o sistema deve negar o meu acesso imediatamente', function () {
    assert.ok(
        response?.status === 400 || response?.status === 401, 
        `O acesso de um token inválido não foi negado como esperado. Status atual: ${response?.status}`
    );
});

Then('o erro apresentado deve indicar que o {string}', function (mensagemEsperada) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    assert.ok(
        corpoResposta.includes(mensagemEsperada), 
        `Erro "${mensagemEsperada}" ausente na resposta de segurança.`
    );
});

Then('o sistema deve aprovar a verificação com sucesso', function () {
    assert.strictEqual(
        response?.status, 
        200, 
        `Esperado status 200 de aprovação, mas recebeu ${response?.status}. Erro: ${response?.data?.error || ''}`
    );
});

Then('a minha conta deve ser criada na base de dados principal como verificada', async function () {
    const user = await prisma.user.findUnique({ where: { email: userData.email } });
    assert.ok(user, `A conta não foi encontrada na base de dados principal para o e-mail: ${userData.email}`);
    assert.strictEqual(user.isVerified, true, "A conta foi criada, mas a flag isVerified ainda está falsa.");
});

Then('o registo temporário associado a {string} deve ser apagado', async function (email: string) {
    const preReg = await prisma.preRegistration.findUnique({ where: { email } });
    assert.strictEqual(preReg, null, "Alerta de Segurança: O registo temporário ainda existe na base de dados após ativação!");
});

Then('o sistema deve rejeitar a tentativa de ativação', function () {
    assert.ok(
        response?.status === 400 || response?.status === 404, 
        `A API deveria ter rejeitado a ativação (400 ou 404), mas retornou ${response?.status}`
    );
});

Then('a minha conta não deve ser criada na base de dados principal', async function () {
    const user = await prisma.user.findUnique({ where: { email: userData.email } });
    assert.strictEqual(user, null, "Erro crítico: a conta foi criada indevidamente na base de dados!");
});

Then('o sistema deve negar a ativação', function () {
    assert.strictEqual(response?.status, 404, `Deveria retornar 404 (Não encontrado/Expirado), retornou ${response?.status}`);
});

Then('o sistema deve apagar o meu pré-registo antigo', async function () {
    const preReg = await prisma.preRegistration.findUnique({ where: { email: userData.email } });
    // Verifica se o ID antigo que guardámos no Given já não é o mesmo do atual
    assert.notStrictEqual(
        preReg?.id, 
        userData.oldPreRegistrationId, 
        "O pré-registo antigo não foi apagado/substituído pelo novo!"
    );
});

Then('um novo código de verificação deve ser gerado e enviado para mim', async function () {
    const preReg = await prisma.preRegistration.findUnique({ where: { email: userData.email } });
    assert.ok(preReg, "O novo pré-registo não foi encontrado.");
    assert.notStrictEqual(
        preReg.verificationCode, 
        "000000", 
        "O código gerado é idêntico ao antigo que foi abandonado."
    );
    assert.ok(
        response?.status === 200 || response?.status === 201, 
        `O registo falhou ao gerar novo código. Status: ${response?.status}`
    );
});

Then('eu devo receber a mensagem {string}', function (mensagemEsperada: string) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    assert.ok(
        corpoResposta.includes(mensagemEsperada),
        `Esperava a mensagem "${mensagemEsperada}", mas a API retornou: ${corpoResposta}`
    );
});

Then('o erro apresentado deve indicar {string}', function (mensagemEsperada: string) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    assert.ok(
        corpoResposta.includes(mensagemEsperada),
        `Esperava o erro "${mensagemEsperada}", mas a API retornou: ${corpoResposta}`
    );
});

Then('o sistema deve bloquear a ação imediatamente', function () {
    assert.ok(
        response?.status === 400 || response?.status === 403, 
        `O sistema deveria ter bloqueado a ação (status 400), mas retornou ${response?.status}`
    );
});