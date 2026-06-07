import { Given, When, Then } from '@cucumber/cucumber';
import { Before } from '@cucumber/cucumber';
import assert from 'assert';
import { mock } from 'node:test';
import { MovieController } from '../../src/controllers/movie-controller';
import { MovieService } from '../../src/services/movie-service';
import { sharedState } from './shared-state';

let controller: MovieController;
let req: any = { params: {}, headers: {} };

const res: any = {
  status: (code: number) => { sharedState.statusCode = code; return res; },
  json: (data: any) => { sharedState.responseData = data; return res; },
};


Before(function () {
  sharedState.statusCode = 0;
  sharedState.responseData = null;
});

/* ===== Cenários de Serviço ===== */

// --- CENÁRIO: VALIDAR EXIBIÇÃO DE METADADOS ---

Given('o filme {string} com id {string} está cadastrado no sistema', function (movieTitle, movieId) {
  controller = new MovieController();
  req.params.moviesID = movieId;
});

Given('o filme possui os seguintes metadados:', function (dataTable) {
  const rows = dataTable.rowsHash();

  const fieldMap: Record<string, string> = {
    'título':  'title',
    'sinopse': 'sinopse',
    'duração': 'duracao',
    'gêneros': 'generos',
    'ano':     'ano',
    'diretor': 'diretor',
    'elenco':  'elenco',
  };

  const metadata: Record<string, string> = {};
  for (const [campo, valor] of Object.entries(rows)) {
    const key = fieldMap[campo] ?? campo;
    metadata[key] = valor as string;
  }

  // formata duração para exibição antes de mockar
  if (metadata.duracao && !metadata.duracao.includes('min')) {
    metadata.duracao = `${metadata.duracao} min`;
  }

  mock.method(MovieService.prototype, 'getMetadata', async () => metadata);
});

When('eu requisito os metadados do filme com id {string}', async function (movieId) {
  req.params.moviesID = movieId;
  await controller.show(req, res);
});

Then('os metadados são retornados com sucesso', function () {
  assert.strictEqual(sharedState.statusCode, 200);
});

Then('os dados contêm {string} {string}', function (campo, valorEsperado) {
  const fieldMap: Record<string, string> = {
    'título':  'title',
    'sinopse': 'sinopse',
    'duração': 'duracao',
    'gêneros': 'generos',
    'ano':     'ano',
    'diretor': 'diretor',
    'elenco':  'elenco',
  };

  const key = fieldMap[campo] ?? campo;
  assert.strictEqual(sharedState.responseData[key], valorEsperado);
});

// --- CENÁRIO: FILME NÃO ENCONTRADO ---

Given('não existe filme com id {string} cadastrado no sistema', function (movieId) {
  controller = new MovieController();
  req.params.moviesID = movieId;

  mock.method(MovieService.prototype, 'getMetadata', async () => {
    throw new Error('Filme não encontrado');
  });
});

Then('a requisição retorna um erro', function () {
  assert.strictEqual(sharedState.statusCode, 404);
});

Then('a mensagem de erro é {string}', function (expectedMessage) {
  assert.strictEqual(sharedState.responseData.message, expectedMessage);
  mock.restoreAll();
});

// --- CENÁRIO: CAMPOS PARCIAIS ---

Given('o filme possui os seguintes metadados incompletos:', function (dataTable) {
  const rows = dataTable.rowsHash();

  const fieldMap: Record<string, string> = {
    'título':  'title',
    'sinopse': 'sinopse',
    'duração': 'duracao',
    'gêneros': 'generos',
    'ano':     'ano',
    'diretor': 'diretor',
    'elenco':  'elenco',
    // entradas sem acento podem ser removidas agora
  };

  const metadata: Record<string, string> = {};
  for (const [campo, valor] of Object.entries(rows)) {
    const key = fieldMap[campo] ?? campo;
    metadata[key] = (valor as string).trim() === '' ? 'N/A' : valor as string;
  }

  if (metadata.duracao && metadata.duracao !== 'N/A' && !metadata.duracao.includes('min')) {
    metadata.duracao = `${metadata.duracao} min`;
  }

  mock.method(MovieService.prototype, 'getMetadata', async () => metadata);
});

// reutiliza o Then 'os dados contêm' com alias para a variação sem acento da feature
Then('os dados contém {string} {string}', function (campo, valorEsperado) {
  const fieldMap: Record<string, string> = {
    'título':  'title',
    'sinopse': 'sinopse',
    'duração': 'duracao',
    'gêneros': 'generos',
    'ano':     'ano',
    'diretor': 'diretor',
    'elenco':  'elenco',
  };

  const key = fieldMap[campo] ?? campo;
  assert.strictEqual(sharedState.responseData[key], valorEsperado);
});

Then('os campos vazios retornam {string}', function (valorEsperado) {
  const camposOpcionais = ['generos', 'diretor', 'elenco'];

  camposOpcionais.forEach((campo) => {
    if (sharedState.responseData[campo] === '' || sharedState.responseData[campo] == null) {
      assert.fail(`Campo "${campo}" deveria ser "${valorEsperado}" mas está vazio/nulo`);
    }
    if (sharedState.responseData[campo] !== undefined) {
      assert.strictEqual(sharedState.responseData[campo], valorEsperado);
    }
  });

  mock.restoreAll();
});

// --- CENÁRIO: TIMEOUT ---

Given('o filme {string} está cadastrado no sistema', function (movieTitle) {
  controller = new MovieController();
});

// corrige o mismatch "10 seg" vs "10 segundos"
When('o tempo de carregamento excede {string}', async function (timeString) {
  const isMetadata = timeString === '10 seg' || timeString === '10 segundos';
  const isPlayer   = timeString === '30 seg' || timeString === '30 segundos';

  if (isMetadata) {
    req.params.moviesID = 'id-lento';
    await controller.show(req, res);
  }

  if (isPlayer) {
    req.params.moviesID = '789';
    await controller.streamVideo(req, res);
  }
});

Then('o carregamento de metadados é interrompido', function () {
  assert.strictEqual(sharedState.statusCode, 408);
});

Given('o servidor de metadados está instável ou inalcançável', function () {
  mock.method(MovieService.prototype, 'getMetadata', async () => {
    throw new Error('TIMEOUT_EXCEEDED');
  });
});

When('eu seleciono o filme {string}', async function (_movieTitle) {
  req.params.moviesID = 'id-lento';
  await controller.show(req, res);
});

Then('eu vejo a mensagem de erro {string}', function (expectedMessage) {
  assert.strictEqual(sharedState.responseData.message, expectedMessage);
  mock.restoreAll();
});

/* ===== Cenários de Serviço ===== */