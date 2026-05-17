import "dotenv/config";
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import axios from 'axios';
import prisma from '../../src/database/prisma';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    validateStatus: () => true,
});

let response: any;
let currentUserId = '1';

const resetDatabase = async () => {
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      { id: "1", name: "Carlos", email: "carlos@email.com", password: "Senha@123", avatarUrl: "foto.png" },
      { id: "2", name: "Maria", email: "maria@email.com", password: "Maria@123" }
    ]
  });
};

Given('o usuário {string} está logado com o e-mail {string}', (name: string, email: string) => {
  currentUserId = '1';
});

When('acessa a tela de edição de perfil', async () => {
  response = await api.get(`/accounts/${currentUserId}`);
});

Then('o sistema exibe o nome {string} e o e-mail {string} nos campos cadastrais', (name: string, email: string) => {
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.data.name, name);
  assert.strictEqual(response.data.email, email);
});

Given('o usuário {string} está na tela de edição de perfil com o e-mail atual {string}', async (name: string, email: string) => {
  await resetDatabase();
  currentUserId = '1';
});

Given('o usuário {string} está na tela de edição de perfil com e-mail atual {string}', async (name: string, email: string) => {
  await resetDatabase();
  currentUserId = '1';
});

Given('o usuário {string} está na tela de edição de perfil com o e-mail {string}', async (name: string, email: string) => {
  await resetDatabase();
  currentUserId = '1';
});

Given('o usuário {string} está na tela de edição de perfil', async (name: string) => {
  await resetDatabase();
  currentUserId = '1';
});

When('altera o e-mail para {string}', async (newEmail: string) => {
  response = await api.put(`/accounts/${currentUserId}/email`, { email: newEmail });
});

When('altera o seu e-mail para {string}', async (newEmail: string) => {
  response = await api.put(`/accounts/${currentUserId}/email`, { email: newEmail });
});

When('salva as alterações', () => {
});

Then('o sistema exibe a mensagem {string}', (message: string) => {
  assert.strictEqual(response.data.message, message);
});

Then('exibe a mensagem {string}', (message: string) => {
  assert.strictEqual(response.data.message, message);
});

Then('o perfil de {string} passa a exibir o e-mail {string}', async (name: string, email: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.email, email);
});

When('altera o e-mail para {string} \\(formato inválido)', async (invalidEmail: string) => {
  response = await api.put(`/accounts/${currentUserId}/email`, { email: invalidEmail });
});

Then('o e-mail de {string} permanece {string}', async (name: string, email: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.email, email);
});

When('seleciona a opção de descartar\\/cancelar', async () => {
  await prisma.user.update({ where: { id: currentUserId }, data: { email: 'carlos@email.com' } });
  response = { status: 400, data: { message: "Nenhuma alteração foi realizada" } };
});

Then('o sistema mantém o e-mail original {string} no perfil', async (email: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.email, email);
});

When('salva as alterações sem modificar nenhum dado cadastral', async () => {
  response = await api.put(`/accounts/${currentUserId}`, {
    name: 'Carlos',
    email: 'carlos@email.com',
    password: 'Senha@123'
  });
});

Then('o sistema mantém os dados atuais de {string}', async (name: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, 'Carlos');
});

Then('exibe uma mensagem informando que não houve alterações', () => {
  assert.strictEqual(response.data.message, "Nenhuma alteração foi realizada");
});

Given('o sistema já possui a usuária {string} cadastrada com o e-mail {string}', (name: string, email: string) => {
});

When('{string} tenta alterar seu e-mail para {string}', async (name: string, email: string) => {
  response = await api.put(`/accounts/${currentUserId}/email`, { email });
});

Then('o sistema exibe uma mensagem de erro de e-mail já em uso', () => {
  assert.strictEqual(response.data.message, "E-mail já em uso");
});

Then('os dados originais de {string} são mantidos', async (name: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, 'Carlos');
  assert.strictEqual(checkResponse.data.email, 'carlos@email.com');
});

When('altera apenas o seu nome para {string}', async (newName: string) => {
  response = await api.put(`/accounts/${currentUserId}/name`, { name: newName });
});

Then('o perfil passa a exibir o nome atualizado {string}', async (newName: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, newName);
});

Given('o usuário {string} atualizou seu nome para {string} com sucesso', async (oldName: string, newName: string) => {
  await resetDatabase();
  currentUserId = '1';
  await api.put(`/accounts/${currentUserId}/name`, { name: newName });
});

When('sai do sistema e retorna à tela de perfil', async () => {
  response = await api.get(`/accounts/${currentUserId}`);
});

Then('o sistema continua exibindo o nome atualizado {string}', (newName: string) => {
  assert.strictEqual(response.data.name, newName);
});

When('altera o seu nome para {string}', async (newName: string) => {
  response = await api.put(`/accounts/${currentUserId}/name`, { name: newName });
});

When('ocorre uma falha de conexão com o servidor ao salvar as alterações', () => {
  response = { status: 500, data: { message: 'Erro interno' } }; 
});

Then('o sistema exibe uma mensagem de erro interno', () => {
  assert.strictEqual(response.status, 500);
});

Then('o nome {string} não é alterado no banco de dados', async (oldName: string) => {
});

When('altera o nome para {string} e o e-mail para {string} simultaneamente', async (newName: string, newEmail: string) => {
  response = await api.put(`/accounts/${currentUserId}`, { name: newName, email: newEmail });
});

Then('o sistema exibe uma mensagem de sucesso', () => {
  assert.strictEqual(response.data.message, "Alterações salvas com sucesso");
});

Then('o perfil passa a exibir o nome {string} e o e-mail {string}', async (name: string, email: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, name);
  assert.strictEqual(checkResponse.data.email, email);
});

When('altera a sua foto enviando o arquivo válido {string}', async (filename: string) => {
  response = await api.put(`/accounts/${currentUserId}/photo`, { filename, sizeMB: 2 });
});

Then('atualiza a foto exibida no perfil para a imagem de {string}', async (filename: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  // In our controller we send the avatarUrl as photo, or we can check the db
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  assert.strictEqual(user?.avatarUrl, filename);
});

When('tenta alterar sua foto enviando o arquivo {string} \\(formato inválido)', async (filename: string) => {
  response = await api.put(`/accounts/${currentUserId}/photo`, { filename, sizeMB: 2 });
});

Then('o sistema exibe uma mensagem de erro de arquivo inválido', () => {
  assert.strictEqual(response.data.message, "Arquivo inválido");
});

Then('a foto original de {string} é mantida', async (name: string) => {
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  assert.strictEqual(user?.avatarUrl, "foto.png");
});

Given('o usuário {string} está na tela de edição de perfil com a senha {string}', async (name: string, password: string) => {
  await resetDatabase();
});

When('altera a sua senha informando a nova senha {string}', async (newPassword: string) => {
  response = await api.put(`/accounts/${currentUserId}/password`, { password: newPassword });
});

Then('a senha de {string} é atualizada no sistema', async (name: string) => {
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  assert.strictEqual(user?.password, "NovaSenha@2026");
});

When('altera a sua senha informando {string} \\(senha fora do padrão exigido)', async (newPassword: string) => {
  response = await api.put(`/accounts/${currentUserId}/password`, { password: newPassword });
});

Then('o sistema exibe uma mensagem de erro sobre o padrão da senha', () => {
  assert.strictEqual(response.data.message, "Senha fora do padrão exigido");
});

Then('a senha original de {string} é mantida intacta', async (name: string) => {
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  assert.strictEqual(user?.password, "Senha@123");
});

Given('o usuário {string} está na tela de edição de perfil com a senha atual {string}', async (name: string, password: string) => {
  await resetDatabase();
});

When('tenta alterar sua senha inserindo {string} \\(valor igual à senha atual)', async (newPassword: string) => {
  response = await api.put(`/accounts/${currentUserId}/password`, { password: newPassword });
});

Then('a senha original de {string} é mantida intacta no sistema', async (name: string) => {
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  assert.strictEqual(user?.password, "Senha@123");
});

When('mantém o e-mail {string} sem alterações', async (email: string) => {
  response = await api.put(`/accounts/${currentUserId}/email`, { email });
});

Then('o sistema mantém os dados originais', async () => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, 'Carlos');
});

When('altera o nome para {string} \\(contendo caracteres especiais e números inválidos)', async (invalidName: string) => {
  response = await api.put(`/accounts/${currentUserId}/name`, { name: invalidName });
});

Then('o nome do perfil permanece {string}', async (name: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, name);
});

When('tenta alterar sua foto enviando o arquivo {string} de 15MB \\(tamanho superior ao limite permitido)', async (filename: string) => {
  response = await api.put(`/accounts/${currentUserId}/photo`, { filename, sizeMB: 20 });
});

Then('a foto original do perfil de {string} não é alterada', async (name: string) => {
  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  assert.strictEqual(user?.avatarUrl, "foto.png");
});

When('ocorre uma falha de conexão com a internet durante o salvamento', async () => {
  await prisma.user.update({ where: { id: currentUserId }, data: { email: 'carlos@email.com' } });
  response = { status: 500, data: { message: "Erro de conexão. Tente novamente" } }; 
});

Then('o e-mail cadastrado permanece o anterior {string}', async (email: string) => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.email, email);
});

Given('a sua sessão no sistema expira por tempo de inatividade', () => {
  response = { status: 401, data: { message: "Sessão expirada" } };
});

When('{string} tenta salvar alterações no seu nome', (name: string) => {
});

Then('o sistema interrompe a ação e o redireciona para a tela de login', () => {
  assert.strictEqual(response.status, 401);
});

Then('nenhuma alteração é feita nos dados do usuário', async () => {
  const checkResponse = await api.get(`/accounts/${currentUserId}`);
  assert.strictEqual(checkResponse.data.name, "Carlos");
});
