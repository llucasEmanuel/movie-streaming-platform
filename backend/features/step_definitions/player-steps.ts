import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'assert';
import { mock } from 'node:test';
import { MovieController } from '../../src/controllers/movie-controller';
import { MovieService } from '../../src/services/movie-service';

let controller: MovieController;
let req: any = { params: {}, headers: {} };
let statusCode = 0;
let responseHeaders: any = {};
let responseData: any = '';

const res: any = {
  status: (code: number) => { statusCode = code; return res; },
  send: (data: any) => { responseData = data; return res; },
  json: (data: any) => { responseData = data; return res; },
  end: () => { return res; }, 
  writeHead: (status: number, headers: any) => {
    statusCode = status;
    responseHeaders = headers;
    return res;
  }
};

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

  // Simula o estouro do cronômetro travando o fetch global
  globalThis.fetch = async () => { throw new Error("STREAM_TIMEOUT"); };
});

Then('o carregamento do filme é interrompido', function () {
  assert.strictEqual(statusCode, 408);
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
  // Adiciona o cabeçalho range simulando o salto na linha do tempo (Seek)
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
  assert.strictEqual(statusCode, 206);
  assert.strictEqual(responseHeaders['Content-Range'], 'bytes 5000000-9999999/10000000');
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
    file_name: null // Dispara o erro de link indisponível
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