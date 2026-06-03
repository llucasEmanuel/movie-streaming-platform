import { Given, When, Then, Before } from "@cucumber/cucumber";
import request from "supertest";
import assert from "assert";
import jwt from "jsonwebtoken";
import app from "../../src/index";
import { prisma } from "../../src/database/prisma-client";

let response: request.Response;
let authHeader: string = "";

// O Before é executado antes de cada cenário
Before(async function () {
  await prisma.movie.deleteMany();
  response = undefined as any;
  authHeader = "";
});

Given("eu acesso o sistema como {string}", function (role: string) {
  const token = jwt.sign(
    { id: "usuario-teste-id", role: role },
    process.env.JWT_SECRET || "secret",
  );
  authHeader = `Bearer ${token}`;
});

Given("que o sistema já possui o filme {string}", async function (title: string) {
  await prisma.movie.create({
    data: {
      title: title,
      synopsis: "Sinopse prévia",
      genres: "Ação",
      duration: "120",
      file_name: "https://archive.org/download/teste/filme.mp4",
    },
  });
});

Given("que o filme com ID {string} não existe no sistema", async function (id: string) {
  // A tabela já foi limpa pelo Before, garantindo que nenhum ID, inclusive este, existe.
});

When(/^eu (?:tento adicionar|adiciono) o filme "([^"]*)" com sinopse "([^"]*)" e duração "([^"]*)"$/, async function (title: string, synopsis: string, durationStr: string) {
  const duration = parseInt(durationStr.replace(/\D/g, ""), 10);
  const payload = {
    title: title,
    synopsis: synopsis,
    genres: ["Aventura"],
    duration: duration,
    url_movie: "https://archive.org/download/novo/filme.mp4",
    url_poster: "https://archive.org/download/novo/poster.jpg",
  };

  let req = request(app).post("/movies");
  if (authHeader) req = req.set("Authorization", authHeader);
  response = await req.send(payload);
});

When("eu tento executar a ação de {string} filme", async function (action: string) {
  let req = request(app).post("/movies");
  if (authHeader) req = req.set("Authorization", authHeader);
  response = await req.send({}); // payload vazio para simular tentativa direta
});

When("eu tento excluir o filme com ID {string}", async function (id: string) {
  let req = request(app).delete(`/movies/${id}`);
  if (authHeader) req = req.set("Authorization", authHeader);
  response = await req.send();
});

Then("o sistema deve retornar a mensagem de erro {string}", function (errorMessage: string) {
  // As respostas podem vir em response.body.message ou response.body.error dependendo da rota/middleware
  const actualMessage = response.body.message || response.body.error;
  assert.strictEqual(actualMessage, errorMessage, `Erro esperado: ${errorMessage}, Erro recebido: ${actualMessage} | HTTP Status: ${response.status}`);
});

Then("o filme {string} deve ser incluído no {string} do sistema", function (title: string, arg2: string) {
  assert.strictEqual(response.status, 201, `Esperado HTTP 201 Created, recebido: ${response.status}`);
  assert.strictEqual(response.body.title, title);
});

Then("o sistema salva o filme {string} com sinopse {string} e duração {string}", function (title: string, synopsis: string, durationStr: string) {
  const expectedDuration = parseInt(durationStr.replace(/\D/g, ""), 10);
  assert.strictEqual(response.body.title, title);
  assert.strictEqual(response.body.synopsis, synopsis);
  assert.strictEqual(Number(response.body.duration), expectedDuration);
});
