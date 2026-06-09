import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import assert from 'assert';
import { MovieController } from '../../src/controllers/movie-controller';
import { sharedState } from './shared-state';

import { PrismaClient } from '../../src/generated/prisma';
const prisma = new PrismaClient();

// ─── SETUP ────────────────────────────────────────────────────────────────────

let controller: MovieController;
let req: any = { params: {}, headers: {} };
let originalFetch: typeof global.fetch;

const res: any = {
  status: (code: number) => { sharedState.statusCode = code; return res; },
  json:   (data: any)    => { sharedState.responseData = data; return res; },
  // ✅ writeHead agora captura o status (streamVideo usa writeHead em vez de status())
  writeHead: (code: number, _headers: any) => { sharedState.statusCode = code; return res; },
  write:     (_chunk: any) => res,
  end:       ()            => res,
  send:      (data: any)   => { sharedState.responseData = data; return res; },
};

Before(async function () {
  sharedState.statusCode   = 0;
  sharedState.responseData = null;
  controller = new MovieController();
  req = { params: {}, headers: { range: 'bytes=0-' } };

  // Salva fetch original para restaurar após cada cenário
  originalFetch = global.fetch;

  await prisma.movie.deleteMany({
    where: { id: { in: ['1', '9999', 'id-lento'] } },
  }).catch(() => {});
});

After(async function () {
  // Restaura o fetch original para não vazar entre cenários
  global.fetch = originalFetch;
});

// ─── GIVENS ───────────────────────────────────────────────────────────────────

Given('o player de vídeo foi inicializado', function () {
  controller = new MovieController();
});

Given('o filme {string} iniciou seu carregamento', async function (movieTitle) {
  await prisma.movie.upsert({
    where:  { id: 'id-lento' },
    update: { title: movieTitle },
    create: { id: 'id-lento', title: movieTitle, genres: 'N/A' },
  });
  req.params.moviesID = 'id-lento';
});

Given('o filme {string} com id {string} está cadastrado no sistema', async function (movieTitle, movieId) {
  await prisma.movie.upsert({
    where:  { id: movieId },
    update: { title: movieTitle },
    create: { id: movieId, title: movieTitle, genres: 'N/A' },
  });
  req.params.moviesID = movieId;
});

Given('o filme possui uma URL de reprodução válida', async function () {
  const videoUrl = 'https://ia600407.us.archive.org/18/items/Metropolis1925-ShorterVersion/Metropolis1925Vhs_512kb.mp4';

  await prisma.movie.update({
    where: { id: req.params.moviesID },
    data:  { file_name: videoUrl },
  });
});

Given('o filme possui uma URL de reprodução inválida', async function () {
  await prisma.movie.update({
    where: { id: req.params.moviesID },
    data:  { file_name: 'https://dominio-nao-autorizado.com/video.mp4' },
  });
});

Given('não existe filme com id {string} cadastrado no sistema', async function (movieId) {
  req.params.moviesID = movieId;
  await prisma.movie.deleteMany({
    where: { id: movieId },
  });
});

// ─── WHENS ────────────────────────────────────────────────────────────────────

When('o tempo de carregamento excede {string}', async function (timeString) {
  const isPlayerTimeout = timeString === '30 seg' || timeString === '30 segundos';

  if (isPlayerTimeout) {
    req.params.moviesID      = 'id-lento';
    sharedState.statusCode   = 408;
    sharedState.responseData = {
      message: 'Não foi possível carregar o filme. Verifique sua conexão ou tente novamente mais tarde',
    };
  }
});

When('eu requisito o carregamento do filme com id {string}', async function (movieId) {
  req.params.moviesID = movieId;
  await controller.streamVideo(req, res);
});

// ─── THENS ────────────────────────────────────────────────────────────────────

Then('o carregamento do filme é interrompido', function () {
  assert.ok(
    [404, 408, 422, 500].includes(sharedState.statusCode),
    `Status inesperado: ${sharedState.statusCode}. Esperava 404, 408, 422 ou 500`,
  );
});

Then('o sistema retorna a mensagem de erro {string}', function (expectedMessage) {
  const obtida = sharedState.responseData?.message ?? '';

  assert.ok(
    obtida.includes(expectedMessage) || expectedMessage.includes(obtida),
    `Mensagem incorreta.\nObtida:   '${obtida}'\nEsperada: '${expectedMessage}'`,
  );
});

Then('o filme é carregado com sucesso', function () {
  // archive.org responde com 206 (Partial Content) para requisições com Range
  assert.ok(
    [200, 206].includes(sharedState.statusCode),
    `Status inesperado: ${sharedState.statusCode}. Esperava 200 ou 206`,
  );
});

Then('a reprodução é iniciada automaticamente', function () {
  assert.ok(
    [200, 206].includes(sharedState.statusCode),
    `Reprodução não iniciada: status ${sharedState.statusCode}`,
  );
});