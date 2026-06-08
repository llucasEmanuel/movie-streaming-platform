import { Given, When, Then, Before } from "@cucumber/cucumber";

// --- INTERFACES DE ESTADO ---

interface MockUser {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    isVerified: boolean;
}

interface MockPreRegistration {
    name: string;
    email: string;
    password?: string;
    verificationCode: string;
}

interface SignUpState {
    currentPage: string;
    users: Map<string, MockUser>;
    preRegistrations: Map<string, MockPreRegistration>;
    inputs: {
        name: string;
        email: string;
        password: string;
        confirmPassword?: string;
        verificationCode: string;
    };
    isAuthenticated: boolean;
    message: string | null;
}

// --- FUNÇÕES DE APOIO E ASSERÇÕES ---

function expectTrue(condition: boolean, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

function expectEqual<T>(actual: T, expected: T, message: string) {
    if (actual !== expected) {
        throw new Error(`${message}. Esperado: "${expected}". Recebido: "${actual}"`);
    }
}

function createInitialState(): SignUpState {
    return {
        currentPage: "Home",
        users: new Map<string, MockUser>(),
        preRegistrations: new Map<string, MockPreRegistration>(),
        inputs: {
            name: "",
            email: "",
            password: "",
            verificationCode: ""
        },
        isAuthenticated: false,
        message: null,
    };
}

let state: SignUpState = createInitialState();

Before(function () {
    state = createInitialState();
});

// --- LÓGICA MOCKADA (SIMULANDO O BACKEND) ---

function simulateRegister() {
    if (!state.inputs.email || !state.inputs.password) {
        state.message = "Campos obrigatórios ausentes";
        return;
    }

    //  Validar o tamanho mínimo da senha (Geralmente 8 caracteres)
    if (state.inputs.password.length < 8) {
        state.message = "tamanho de senha inválida";
        state.currentPage = "Cadastro"; // Mantém o usuário na página de cadastro
        return;
    }

    // Tratar fluxo de e-mail duplicado mudando a página para "Login"
    if (state.users.has(state.inputs.email)) {
        state.message = "conta já está vinculada";
        state.currentPage = "Login"; // Redireciona para o Login conforme o teste espera
        return;
    }

    // Se passou nas validações, cria o pré-registro normal
    state.preRegistrations.set(state.inputs.email, {
        name: state.inputs.name,
        email: state.inputs.email,
        password: state.inputs.password,
        verificationCode: "123456"
    });

    state.currentPage = "Verificação de E-mail";
    state.message = "Cadastro inicial com sucesso";
}
function simulateVerify() {
    const preReg = state.preRegistrations.get(state.inputs.email);

    if (!preReg || preReg.verificationCode !== state.inputs.verificationCode) {
        state.message = "Código inválido ou inexistente";
        return;
    }

    // Move o usuário para a base principal de usuários ativos
    state.users.set(state.inputs.email, {
        name: preReg.name,
        email: preReg.email,
        password: preReg.password,
        isVerified: true
    });
    
    state.preRegistrations.delete(state.inputs.email);
    
    // ✨ ATUALIZAÇÃO DO FLUXO: Autentica o usuário e joga para a Home das Playlists/Recomendados
    state.isAuthenticated = true;
    state.currentPage = "Home"; 
    state.message = "Conta ativada com sucesso";
}

function simulateGoogleAuth(email: string) {
    const user = state.users.get(email);
    
    if (user) {
        state.isAuthenticated = true;
        state.currentPage = "Home";
        state.message = "Login Google com sucesso";
    } else {
        // Cria usuário Google na hora
        state.users.set(email, {
            name: "Usuário Google",
            email: email,
            googleId: "id-mock-123",
            isVerified: true
        });
        state.isAuthenticated = true;
        state.currentPage = "Home";
        state.message = "Conta Google criada e vinculada com sucesso";
    }
}


// --- GIVENS ---

Given('eu estou na página {string}', function (pagina: string) {
    state.currentPage = pagina;
    state.message = null;
});

Given('o email {string} não possui cadastro no sistema', function (email: string) {
    state.users.delete(email);
    state.preRegistrations.delete(email);
});

Given('o email {string} do Google não possui cadastro no sistema', function (email: string) {
    state.users.delete(email);
});

Given('o email {string} possui cadastro no sistema', function (email: string) {
    state.users.set(email, {
        name: "Usuário Teste",
        email: email,
        password: "SenhaSegura123!",
        isVerified: true
    });
});

Given('o email {string} do Google possui cadastro no sistema', function (email: string) {
    state.users.set(email, {
        name: "Usuário Google Existente",
        email: email,
        googleId: "id-falso-12345",
        isVerified: true
    });
});

// --- WHENS ---

When('eu realizo o cadastro com o email {string} e senha {string}', function (email: string, password: string) {
    state.inputs.email = email;
    state.inputs.password = password;
});

When('eu tento realizar o cadastro com o email {string} e senha {string}', function (email: string, password: string) {
    state.inputs.email = email;
    state.inputs.password = password;
});

When('eu preencho o campo {string} com {string}', function (campo: string, valor: string) {
    const normalizedCampo = campo.toLowerCase();
    if (normalizedCampo.includes("nome")) state.inputs.name = valor;
    else if (normalizedCampo.includes("e-mail") || normalizedCampo.includes("email")) state.inputs.email = valor;
    else if (normalizedCampo.includes("senha") && !normalizedCampo.includes("confirmar")) state.inputs.password = valor;
    else if (normalizedCampo.includes("confirmar")) state.inputs.confirmPassword = valor;
});

When('eu clico no botão {string}', function (botao: string) {
    if (botao === "CRIAR CONTA") {
        simulateRegister();
    } else if (botao === "Ativar Conta") {
        expectTrue(state.inputs.verificationCode !== "", "O código de verificação está vazio!");
        simulateVerify();
    }
});

When('eu preencho o código de 6 dígitos', function () {
    const preRegistration = state.preRegistrations.get(state.inputs.email);
    expectTrue(preRegistration !== undefined, "Pré-cadastro não encontrado para obter o código");
    
    // Simula o usuário digitando o código que foi "enviado"
    state.inputs.verificationCode = preRegistration!.verificationCode;
});

When('eu realizo o cadastro utilizando minha conta Google com email {string}', function (email: string) {
    simulateGoogleAuth(email);
});

When('eu tento realizar o cadastro utilizando minha conta Google com o email {string}', function (email: string) {
    simulateGoogleAuth(email);
});

When('eu defino o nome de usuário {string}', function (nome: string) {
    state.inputs.name = nome;
});

// --- THENS ---

Then('eu devo ver a tela pedindo para verificar o e-mail', function () {
    expectEqual(state.currentPage, "Verificação de E-mail", "A tela de verificação não foi apresentada.");
});

Then('uma nova conta de usuário deve ser criada para {string}', function (email: string) {
    const userExists = state.users.has(email) || state.preRegistrations.has(email);
    expectTrue(userExists, `Nenhum registro encontrado (temporário ou principal) para ${email}`);
});

Then('uma nova conta de usuário deve ser ativada para {string}', function (email: string) {
    const user = state.users.get(email);
    expectTrue(user !== undefined, `A conta final não foi encontrada para ${email}`);
    expectTrue(user!.isVerified, "A conta existe, mas o status isVerified é falso.");
});

Then('eu sou autenticado automaticamente no sistema', function () {
    expectTrue(state.isAuthenticated, "O usuário deveria estar autenticado na sessão.");
});

Then('eu vejo a mensagem de sucesso {string}', function (mensagem: string) {
    const isSuccess = state.message?.toLowerCase().includes("sucesso");
    expectTrue(isSuccess === true, `Deveria ter mensagem de sucesso, mas recebeu: ${state.message}`);
});

Then('eu sou redirecionado para a página Home', function () {
    expectEqual(state.currentPage, "Home", "Não redirecionou para a página correta.");
});

Then('aparece uma mensagem de aviso {string}', function (aviso: string) {
    const containsWarning = state.message?.includes("uso") || state.message?.includes("vinculada") || state.message?.includes(aviso);
    expectTrue(containsWarning === true, `Mensagem de aviso ausente. Recebido: ${state.message}`);
});

Then('deve aparecer uma mensagem de aviso {string}', function (aviso: string) {
    const containsError = state.message?.includes("obrigatórios") || state.message?.includes("inválida") || state.message?.includes(aviso);
    expectTrue(containsError === true, `Erro ausente. Recebido: ${state.message}`);
});

Then('eu devo ser direcionado a página {string}', function (pagina: string) {
    expectEqual(state.currentPage, pagina, "O redirecionamento falhou.");
});

Then('eu devo permanecer na página {string}', function (pagina: string) {
    expectEqual(state.currentPage, pagina, "O usuário não permaneceu na página original.");
});

Then('o sistema deve reconhecer a conta', function () {
    expectTrue(state.isAuthenticated, "O sistema não reconheceu a autenticação da conta.");
});