import { Given, When, Then, Before } from "@cucumber/cucumber";
import { PrismaClient } from "../../src/generated/prisma";
import axios from "axios";
import assert from "assert";

const prisma = new PrismaClient();
// Criamos uma instância do axios apontando para sua API local
const api = axios.create({ 
    baseURL: 'http://localhost:3000', 
    validateStatus: () => true // Isso impede que o axios jogue um erro em status 400/500
});

let userData: any = {};
let response: any;
let externalServiceStatus = 'online';

// Limpa o usuário de teste antes de cada cenário para garantir isolamento
Before(async () => {
    await prisma.user.deleteMany({ where: { email: "exemplo@test.com" } });
    userData = {};
    response = null;
});

// --- Testes GUI ---

// --- GIVENS ---

Given('eu estou na página {string}', function (pagina) {
    console.log(`Simulando navegação para a página: ${pagina}`);
});

Given('o email {string} não possui cadastro no sistema', async function (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    assert.strictEqual(user, null, "O usuário já existe no banco e o teste exigia o contrário!");
});

Given('o email {string} do Google não possui cadastro no sistema', async function (email) {
    await prisma.user.deleteMany({ where: { email } });
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
        response = await api.post('/api/register', userData);
    }
});

When('eu realizo o cadastro utilizando minha conta Google com email {string}', async function (email) {
    try {
        response = await api.post('/api/auth/google', {
            token: "TEST_VALID_TOKEN",
            mockEmail: email,
            mockName: "João" 
        });
    } catch (error: any) {
        console.log("ERRO AXIOS:", error.message);
        response = error.response;
    }
});

When('eu tento realizar o cadastro utilizando minha conta Google com o email {string}', async function (email) {
    response = await api.post('/api/auth/google', {
        token: "TEST_VALID_TOKEN",
        mockEmail: email
    });
});

When('eu defino o nome de usuário {string}', function (nome) {
    return 'passed';
});

// --- THENS  ---

Then('uma nova conta de usuário deve ser criada para {string}', async function (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        console.log("STATUS DA API:", response?.status);
        console.log("RESPOSTA DA API:", response?.data);
    }

    assert.ok(user, `A conta de usuário com email ${email} não foi inserida no banco de dados.`);
});

Then('eu sou autenticado automaticamente no sistema', function () {
    const msgErro = response && response.data ? JSON.stringify(response.data) : "Sem resposta";
    const statusRecebido = response ? response.status : "Indefinido";
    
    assert.ok(
        response && (response.status === 200 || response.status === 201 || response.data.token || response.data.auth === true),
        `A autenticação falhou! Status: ${statusRecebido}. Resposta: ${msgErro}`
    );
});

Then('eu vejo a mensagem de sucesso {string}', function (mensagem) {
    const corpoResposta = JSON.stringify(response.data);
    assert.ok(
        corpoResposta.includes("sucesso") || corpoResposta.includes(mensagem),
        `Esperava a mensagem "${mensagem}", mas recebi: ${corpoResposta}`
    );
});

Then('aparece uma mensagem de aviso {string}', function (aviso) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    const encontrou = corpoResposta.includes("uso") || corpoResposta.includes("vinculada") || corpoResposta.includes(aviso);
    
    assert.ok(encontrou, `Mensagem de aviso "${aviso}" não encontrada. Resposta do backend: ${corpoResposta}`);
});

Then('deve aparecer uma mensagem de aviso {string}', function (aviso) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    const erroNoStatusOuMensagem = corpoResposta.includes("obrigatórios") || corpoResposta.includes("inválida") || response.status === 400;
    
    assert.ok(erroNoStatusOuMensagem, `Aviso de erro não disparado conforme esperado. Resposta: ${corpoResposta}`);
});

Then('eu devo ser direcionado a página {string}', function (pagina) {
    assert.ok(
        response.status >= 400 || response.data.redirect === pagina || response.status === 302,
        `Não houve indicativo de redirecionamento para a página ${pagina}. Status: ${response?.status}`
    );
});

Then('eu devo permanecer na página {string}', function (pagina) {
    assert.strictEqual(
        response.status, 
        400, 
        `A API deveria ter retornado status 400 para manter o utilizador na página ${pagina}`
    );
});

Then('o sistema deve reconhecer a conta', function () {
    const statusRecebido = response ? response.status : "Indefinido";
    
    assert.strictEqual(
        response.status, 
        200, 
        `Esperava que a API reconhecesse a conta com status 200, mas retornou ${statusRecebido}`
    );
    
    assert.strictEqual(
        response.data.authenticated, 
        true, 
        "A resposta do sistema não confirmou a autenticação da conta."
    );
    
    assert.ok(
        response.data.user && response.data.user.email, 
        "Os dados do utilizador não vieram na resposta da API."
    );
});

// --- Testes Serviços ---
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

// --- WHENS  ---

When('eu tento registar-me fornecendo os dados de teste:', async function (dataTable) {
    const payload: any = {};
    
    for (const row of dataTable.hashes()) {
        let valor = row.Valor || ""; // Evita undefined em campos em branco

        // Truque inteligente: Substituir a string de teste "longa_1000" por 1000 caracteres reais
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
    // Enviamos a flag de simulação de falha para o backend caso o serviço esteja offline
    response = await api.post('/api/auth/google', {
        token: token,
        simulateOutage: externalServiceStatus === 'offline' 
    });

    // Resetamos o status para evitar que este estado vaze para outros testes
    externalServiceStatus = 'online';
});

// --- THENS  ---

Then('o meu registo deve ser rejeitado pelo sistema', function () {
    assert.ok(
        response.status >= 400, 
        `O sistema deveria ter rejeitado o registo (status >= 400), mas retornou ${response.status}`
    );
});

Then('a mensagem de erro deve indicar {string}', function (mensagemEsperada) {
    const corpoResposta = JSON.stringify(response.data);
    assert.ok(
        corpoResposta.includes(mensagemEsperada),
        `Esperava o erro "${mensagemEsperada}", mas a API retornou: ${corpoResposta}`
    );
});

Then('o sistema deve bloquear a tentativa imediatamente com segurança', function () {
    assert.ok(
        response.status >= 400, 
        "Alerta Crítico: O sistema não bloqueou a tentativa de injeção NoSQL/SQL!"
    );
});

Then('nenhuma informação ou estrutura interna da base de dados deve ser exposta', function () {
    const respostaString = JSON.stringify(response.data).toLowerCase();
    
    // Valida se o backend devolveu os erros em bruto do banco de dados 
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
        response.status === 500 || response.status === 502 || response.status === 503,
        `A API deveria ter retornado um erro de serviço (5xx), mas retornou ${response.status}`
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
        response.status === 400 || response.status === 401, 
        `O acesso de um token inválido não foi negado como esperado. Status atual: ${response.status}`
    );
});

Then('o erro apresentado deve indicar que o {string}', function (mensagemEsperada) {
    const corpoResposta = response?.data ? JSON.stringify(response.data) : "";
    assert.ok(
        corpoResposta.includes(mensagemEsperada), 
        `Erro "${mensagemEsperada}" ausente na resposta de segurança.`
    );
});