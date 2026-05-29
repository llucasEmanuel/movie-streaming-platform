import { Given, When, Then } from '@cucumber/cucumber';
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

// --- CENÁRIO: VALIDAR EXIBIÇÃO DE METADADOS ---
Given('eu acesso o sistema como {string}', function (role) {
  controller = new MovieController();
});

When('eu seleciono o filme {string}', async function (movieTitle) {
  req.params.moviesID = 'mocked-id';

  if (movieTitle === "Metropolis") {
    mock.method(MovieService.prototype, 'getMetadata', async () => ({
      id: 'mocked-id',
      title: 'Metropolis',
      sinopse: 'Numa cidade futurística...',
      generos: 'Drama, Ficção Científica',
      duracao: '153 minutos',
      diretor: 'Fritz Lang',
      elenco: 'Brigitte Helm, Alfred Abel, Gustav Fröhlich'
    }));
  } else if (movieTitle === "The Rink") {
    mock.method(MovieService.prototype, 'getMetadata', async () => ({
      id: 'mocked-id',
      title: 'The Rink',
      sinopse: 'N/A', generos: 'N/A', duracao: 'N/A', diretor: 'N/A', elenco: 'N/A'
    }));
  } else if (movieTitle === "Filme Sem Título") {
    mock.method(MovieService.prototype, 'getMetadata', async () => ({
      id: 'mocked-id',
      title: 'N/A', sinopse: 'N/A', generos: 'N/A', duracao: 'N/A', diretor: 'N/A', elenco: 'N/A'
    }));
  }

  await controller.show(req, res);
});

Then('eu vejo a página {string} do filme {string}', function (pageName, movieTitle) {
  // Frontend
});

Then('os campos devem estar preenchidos adequadamente:', function (dataTable) {
  const expectedRows = dataTable.hashes();

  expectedRows.forEach((row: any) => {
    const fieldMap: any = { 'título': 'title', 'gêneros': 'generos', 'duração': 'duracao' };
    const fieldKey = fieldMap[row.campo] || row.campo;

    assert.strictEqual(sharedState.responseData[fieldKey], row.valor);
  });

  mock.restoreAll();
});

Then('eu vejo a opção {string}', function (optionName) {
  // Frontend
});

// --- CENÁRIO: TIMEOUT DE METADADOS ---
Given('o servidor de metadados está instável ou inalcançável', function () {
  controller = new MovieController();

  mock.method(MovieService.prototype, 'getMetadata', async () => {
    throw new Error("TIMEOUT_EXCEEDED");
  });
});

When('o tempo de carregamento excede {string}', async function (timeString) {
  if (timeString === "10 segundos") {
    req.params.moviesID = 'id-lento';
    await controller.show(req, res);
  }
  if (timeString === "30 segundos") {
    controller = new MovieController();
    req.params.moviesID = '789';
    await controller.streamVideo(req, res);
  }
});

Then('o carregamento de metadados é interrompido', function () {
  assert.strictEqual(sharedState.statusCode, 408);
});

Then('eu vejo a mensagem de erro {string}', function (expectedMessage) {
  assert.strictEqual(sharedState.responseData.message, expectedMessage);
  mock.restoreAll();
});

Then('eu continuo na página {string} do filme {string}', function (pageName, movieTitle) {
  // Frontend
});