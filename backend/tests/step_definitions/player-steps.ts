import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'assert';
import { mock } from 'node:test';
import { MovieController } from '../../src/controllers/movie-controller';
import { MovieService } from '../../src/services/movie-service';
import { sharedState } from './shared-state';

let controller: MovieController;
let req: any = { params: {}, headers: {} };

const res: any = {
  status: (code: number) => { sharedState.statusCode = code; return res; },
  send: (data: any) => { sharedState.responseData = data; return res; },
  json: (data: any) => { sharedState.responseData = data; return res; },
  end: () => res,
  write: (data: any) => res,
  writeHead: (status: number, headers: any) => {
    sharedState.statusCode = status;
    sharedState.responseHeaders = headers;
    return res;
  }
};

Before(function () {
  sharedState.statusCode = 0;
  sharedState.responseData = {};
  sharedState.responseHeaders = {};
  req = { params: {}, headers: {} };
});

// --- CENÁRIO: Timeout no carregamento do filme ---

Given('o player de vídeo foi inicializado', function () {
  controller = new MovieController();
});

Given('o filme {string} iniciou seu carregamento', function (movieTitle) {
  req.params.moviesID = '789';
  req.headers.range = 'bytes=0-';

  mock.method(MovieService.prototype, 'getRawMovieData', async () => ({
    id: '789',
    title: movieTitle,
    file_name: 'https://archive.org/the-rink.mp4'
  }));

  globalThis.fetch = async () => { throw new Error("STREAM_TIMEOUT"); };
});

Then('o carregamento do filme é interrompido', function () {
  assert.strictEqual(sharedState.statusCode, 408);
});


// --- CENÁRIO: Adiantamento na reprodução do filme ---

Given('o filme {string} está sendo reproduzido', function (movieTitle) {
  controller = new MovieController();
  req.params.moviesID = '2';

  mock.method(MovieService.prototype, 'getRawMovieData', async () => ({
    id: '2',
    title: movieTitle,
    file_name: 'https://archive.org/movie.mp4'
  }));
});

When('eu adianto a posição da barra de progresso', async function () {
  req.headers.range = "bytes=5000000-";

  globalThis.fetch = async (url: any, options: any) => {
    return {
      status: 206,
      headers: new Map([
        ['content-type', 'video/mp4'],
        ['content-range', 'bytes 5000000-9999999/10000000']
      ]),
      body: { getReader: () => ({ read: async () => ({ done: true, value: null }) }) }
    } as any;
  };

  await controller.streamVideo(req, res);
});

Then('o novo trecho do filme deve ser carregado', function () {
  assert.strictEqual(sharedState.statusCode, 206);
  assert.strictEqual(sharedState.responseHeaders['Content-Range'], 'bytes 5000000-9999999/10000000');
});

Then('a reprodução deve ser retomada do novo trecho', function () {
  mock.restoreAll();
});


// --- CENÁRIO: Link de reprodução corrompido ou inexistente ---

Given('o link de reprodução do filme {string} está corrompido ou inexistente', function (movieTitle) {
  controller = new MovieController();
  req.params.moviesID = '123';
  req.headers = {};

  mock.method(MovieService.prototype, 'getRawMovieData', async () => ({
    id: '123',
    title: movieTitle,
    file_name: null
  }));
});

Given('eu estou na página {string} do filme {string}', function (pageName, movieName) {
  // Frontend
});

When('eu seleciono a opção {string}', async function (optionName) {
  if (optionName === "Assistir") {
    await controller.streamVideo(req, res);
  }
});

Then('eu visualizo a mensagem de erro {string}', function (expectedMessage) {
  assert.strictEqual(sharedState.responseData.message, expectedMessage);
  mock.restoreAll();
});