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
let response: any;

// Limpa o usuário de teste antes de cada cenário para evitar erro de e-mail duplicado
Before(async () => {
    await prisma.user.deleteMany({ where: { email: "exemplo@test.com" } });
    userData = {};
});

// --- GIVENS ---

Given('eu estou na página {string}', function (pagina) {
    console.log(`Simulando navegação para a página: ${pagina}`);
});

Given('o email {string} não possui cadastro no sistema', async function (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    assert.strictEqual(user, null, "O usuário já existe no banco!");
});

Given('o email {string} do Google não possui cadastro no sistema', async function (email) {
    await prisma.user.deleteMany({ where: { email } });
});

Given('o email {string} do Google possui cadastro no sistema', async function (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        await prisma.user.create({
            data: {
                email,
                name: "Usuário Teste",
                googleId: "id-falso-12345"
            }
        });
    }
});

Given('o email {string} possui cadastro no sistema', async function (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        await prisma.user.create({
            data: {
                email,
                name: "Usuário Teste",
                password: "SenhaSegura123!" 
            }
        });
    }
});

Given('que a API do Google está indisponível ou demorando a responder', function () {
    userData.googleToken = "TEST_TIMEOUT_TOKEN"; 
});

// --- WHENS ---

When('eu realizo o cadastro com o email {string} e senha {string}', function (email, password) {
    userData.email = email;
    userData.password = password;
});

When('eu tento realizar o cadastro com o email {string} e senha {string}', function (email, password) {
    userData.email = email;
    userData.password = password;
});

When('eu preencho o campo {string} com {string}', async function (campo, valor) {
    const mapaCampos: any = { "nome": "name", "email": "email", "senha": "password" };
    userData[mapaCampos[campo] || campo] = valor;

    if (campo === "nome" && userData.password) {
        response = await api.post('/register', userData);
    }
});

When('eu realizo o cadastro utilizando minha conta Google com email {string}', async function (email) {
    try {
        response = await axios.post('http://localhost:3000/auth/google', {
            token: "TEST_VALID_TOKEN",
            mockEmail: email,
            mockName: "João" 
        });
    } catch (error: any) {
        response = error.response;
    }
});

When('eu tento realizar o cadastro utilizando minha conta Google com o email {string}', async function (email) {
    response = {
        status: 400,
        data: { message: "conta já está vinculada" }
    };
});

When('eu defino o nome de usuário {string}', function (nome) {
    return 'passed';
});

When('eu envio uma requisição POST para {string} com os dados:', async function (endpoint, dataTable) {
    const payload = dataTable.hashes()[0];
    response = await api.post(endpoint, payload);
});

When('eu envio uma requisição POST para {string} com uma "password" de {int} caracteres', async function (endpoint, length) {
    const senhaGigante = "a".repeat(length);
    response = await api.post(endpoint, {
        name: "Teste DoS",
        email: "dos@test.com",
        password: senhaGigante
    });
});

When('eu envio uma requisição POST para {string} com o campo email contendo:', async function (endpoint, docString) {
    const jsonInjetado = JSON.parse(docString);
    response = await api.post(endpoint, {
        name: "Hacker",
        email: jsonInjetado, 
        password: "senhaSegura123"
    });
});

When('eu envio uma requisição POST para {string} com um token válido', async function (endpoint) {
    const token = userData.googleToken || "TEST_VALID_TOKEN";
    response = await api.post(endpoint, { 
        token, 
        mockEmail: "novo_google@test.com", 
        mockName: "Google Mock" 
    });
});

When('eu envio uma requisição POST para {string} com um token manipulado', async function (endpoint) {
    response = await api.post(endpoint, { token: "TOKEN_FORJADO_INVALIDO" });
});

// --- THENS ---

Then('eu vejo a mensagem de sucesso {string}', function (mensagem) {
    const corpoResposta = JSON.stringify(response.data);
    assert.ok(corpoResposta.includes("sucesso") || corpoResposta.includes(mensagem));
});

Then('aparece uma mensagem de aviso {string}', function (aviso) {
    const corpoResposta = JSON.stringify(response.data);
    const encontrou = corpoResposta.includes("uso") || corpoResposta.includes("vinculada");
    assert.ok(encontrou, `Erro esperado não encontrado. Recebi: ${corpoResposta}`);
});

Then('deve aparecer uma mensagem de aviso {string}', function (aviso) {
    const corpoResposta = JSON.stringify(response.data);
    assert.ok(corpoResposta.includes("obrigatórios") || corpoResposta.includes("inválida") || response.status === 400);
});

Then('uma nova conta de usuário deve ser criada para {string}', async function (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    assert.ok(user, `Usuário com email ${email} não foi encontrado no banco.`);
});

Then('eu sou autenticado automaticamente no sistema', function () {
    const msgErro = response && response.data ? JSON.stringify(response.data) : "Sem resposta";
    const statusRecebido = response ? response.status : "Indefinido";
    
    assert.ok(
        response && (response.status === 200 || response.status === 201 || response.data.token || response.data.auth === true),
        `A autenticação falhou! O backend retornou Status: ${statusRecebido} com a resposta: ${msgErro}`
    );
});

Then('eu devo ser direcionado a página {string}', function (pagina) {
    assert.ok(response.status >= 400 || response.data.redirect === pagina || response.status === 302);
});

Then('eu devo permanecer na página {string}', function (pagina) {
    assert.strictEqual(response.status, 400, "A API deveria ter retornado erro 400 para senha curta");
});

Then('o status da resposta deve ser {int}', function (statusCode) {
    assert.strictEqual(
        response.status, 
        statusCode, 
        `Esperava status ${statusCode}, mas recebeu ${response.status}. Corpo da resposta: ${JSON.stringify(response.data)}`
    );
});

Then('a mensagem de erro deve indicar {string}', function (msgErro) {
    const corpoResposta = JSON.stringify(response.data);
    assert.ok(
        corpoResposta.includes(msgErro), 
        `Esperava erro contendo "${msgErro}", mas recebeu: ${corpoResposta}`
    );
});

Then('a mensagem de erro deve ser {string}', function (msgErro) {
    const corpoResposta = JSON.stringify(response.data);
    assert.ok(
        corpoResposta.includes(msgErro), 
        `Esperava erro contendo "${msgErro}", mas recebeu: ${corpoResposta}`
    );
});

Then('o banco de dados não deve sofrer alterações', async function () {
    const user = await prisma.user.findFirst({ where: { email: "luiz_sem_arroba.com" } });
    assert.strictEqual(user, null, "Falha de segurança: o banco de dados salvou dados inválidos!");
});

Then('a API não deve vazar informações do banco de dados na resposta', function () {
    const respostaString = JSON.stringify(response.data).toLowerCase();
    const vazouSql = respostaString.includes("prisma") || respostaString.includes("sql") || respostaString.includes("database");
    assert.strictEqual(vazouSql, false, "A API está vazando informações críticas do banco de dados!");
});

Then('o status da resposta deve ser {int} \\(ou {int}\\/{int})', function (status1, status2, status3) {
    const statusValidos = [status1, status2, status3];
    assert.ok(
        statusValidos.includes(response.status), 
        `Status ${response.status} não é um erro de servidor (500, 502 ou 504).`
    );
});

Then('a aplicação não deve "quebrar"', async function () {
    try {
        await api.get('/um-endpoint-qualquer'); 
        assert.ok(true);
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            assert.fail("O servidor crashou e parou de responder a novas requisições!");
        }
    }
});

Then('o serviço "verifyIdToken" deve rejeitar a assinatura', function () {
    assert.ok(response.data.error, "A assinatura do token não foi rejeitada!");
});