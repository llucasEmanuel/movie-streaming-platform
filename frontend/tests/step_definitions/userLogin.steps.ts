import { Before, Given, Then, When } from "@cucumber/cucumber";

interface LoginUserState {
  email: string;
  password: string;
  active: boolean;
}

interface AuthenticatedUserState {
  email: string;
}

interface LoginState {
  currentPage: "Welcome" | "Login" | "Página Principal" | "Minhas Playlists";
  users: Map<string, LoginUserState>;
  lastConfiguredEmail: string | null;
  emailInput: string;
  passwordInput: string;
  authenticatedUser: AuthenticatedUserState | null;
  sessionActive: boolean;
  message: string | null;
  authAttemptSent: boolean;
}

function expectTrue(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado: ${expected}. Recebido: ${actual}`);
  }
}

function createInitialState(): LoginState {
  return {
    currentPage: "Welcome",
    users: new Map<string, LoginUserState>(),
    lastConfiguredEmail: null,
    emailInput: "",
    passwordInput: "",
    authenticatedUser: null,
    sessionActive: false,
    message: null,
    authAttemptSent: false,
  };
}

let state: LoginState = createInitialState();

function resetState() {
  state = createInitialState();
}

function renderLoginPage() {
  state.currentPage = "Login";
  state.emailInput = "";
  state.passwordInput = "";
  state.message = null;
  state.authAttemptSent = false;
}

function ensureUserExists(email: string) {
  const existingUser = state.users.get(email);

  if (existingUser) {
    existingUser.active = true;
    return;
  }

  state.users.set(email, {
    email,
    password: "",
    active: true,
  });
}

function getUser(email: string) {
  return state.users.get(email);
}

function authenticateWithEmailAndPassword() {
  if (!state.emailInput.trim() || !state.passwordInput.trim()) {
    state.authAttemptSent = false;
    state.authenticatedUser = null;
    state.sessionActive = false;
    state.currentPage = "Login";
    state.message = "Preencha todos os campos obrigatórios";
    return;
  }

  state.authAttemptSent = true;

  const user = getUser(state.emailInput);

  if (!user || !user.active || user.password !== state.passwordInput) {
    state.authenticatedUser = null;
    state.sessionActive = false;
    state.currentPage = "Login";
    state.message = "E-mail ou senha inválidos";
    return;
  }

  state.authenticatedUser = {
    email: user.email,
  };

  state.sessionActive = true;
  state.currentPage = "Página Principal";
  state.message = null;
}

Before(function () {
  resetState();
});

Given("eu estou na tela inicial do CInema", function () {
  state.currentPage = "Welcome";
  state.authenticatedUser = null;
  state.sessionActive = false;
});

Given("eu estou na tela de login", function () {
  renderLoginPage();
});

Given(
  "existe uma conta ativa cadastrada com o e-mail {string}",
  function (email: string) {
    ensureUserExists(email);
    state.lastConfiguredEmail = email;
  },
);

Given(
  "a senha cadastrada para essa conta é {string}",
  function (password: string) {
    expectTrue(
      state.lastConfiguredEmail !== null,
      "É necessário informar uma conta antes de configurar a senha",
    );

    const user = getUser(state.lastConfiguredEmail);

    expectTrue(
      user !== undefined,
      `A conta "${state.lastConfiguredEmail}" deveria existir`,
    );

    user.password = password;
  },
);

Given(
  "não existe uma conta cadastrada com o e-mail {string}",
  function (email: string) {
    state.users.delete(email);
    state.lastConfiguredEmail = email;
  },
);

When("eu seleciono a opção {string}", function (option: string) {
  if (option === "Fazer Login") {
    renderLoginPage();
    return;
  }

  throw new Error(`Opção não reconhecida: ${option}`);
});

When(
  "eu preencho o campo de login {string} com {string}",
  function (fieldName: string, value: string) {
    const normalizedFieldName = fieldName.trim().toLowerCase();

    if (normalizedFieldName === "e-mail" || normalizedFieldName === "email") {
      state.emailInput = value;
      return;
    }

    if (normalizedFieldName === "senha") {
      state.passwordInput = value;
      return;
    }

    throw new Error(`Campo de login não reconhecido: ${fieldName}`);
  },
);

When("eu seleciono a opção de login {string}", function (option: string) {
  if (option === "Entrar") {
    authenticateWithEmailAndPassword();
    return;
  }

  throw new Error(`Opção de login não reconhecida: ${option}`);
});

When("eu acesso a página {string}", function (pageName: string) {
  expectTrue(
    state.sessionActive,
    "O usuário precisa estar autenticado para acessar páginas internas",
  );

  if (pageName === "Minhas Playlists") {
    state.currentPage = "Minhas Playlists";
    return;
  }

  throw new Error(`Página não reconhecida no teste de login: ${pageName}`);
});

Then("a tela de login deve ser exibida", function () {
  expectEqual(
    state.currentPage,
    "Login",
    "A tela de login deveria estar sendo exibida",
  );
});

Then("a página principal da plataforma deve ser exibida", function () {
  expectEqual(
    state.currentPage,
    "Página Principal",
    "A página principal deveria estar sendo exibida",
  );
});

Then("a sessão do usuário deve permanecer ativa", function () {
  expectTrue(state.sessionActive, "A sessão do usuário deveria permanecer ativa");

  expectTrue(
    state.authenticatedUser !== null,
    "Deveria existir um usuário autenticado na sessão",
  );
});

Then("deve exibir a mensagem {string}", function (expectedMessage: string) {
  expectEqual(
    state.message,
    expectedMessage,
    "A mensagem exibida não corresponde ao esperado",
  );
});

Then("a tela de login deve continuar sendo exibida", function () {
  expectEqual(
    state.currentPage,
    "Login",
    "A tela de login deveria continuar sendo exibida",
  );
});

Then("as playlists exibidas devem pertencer ao usuário logado", function () {
  expectTrue(
    state.sessionActive,
    "O usuário precisa estar autenticado para visualizar suas playlists",
  );

  expectTrue(
    state.authenticatedUser !== null,
    "Deveria existir um usuário autenticado para validar playlists",
  );

  expectEqual(
    state.currentPage,
    "Minhas Playlists",
    "A página Minhas Playlists deveria estar sendo exibida",
  );
});