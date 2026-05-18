import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { mock } from 'node:test';
import { MovieController } from '../../src/controllers/movie-controller';
import { MovieService } from '../../src/services/movie-service';

let controller: MovieController;
let req: any = { params: {} };
let statusCode = 0;
let responseData: any = {};

const res: any = {
  status: (code: number) => { statusCode = code; return res; },
  json: (data: any) => { responseData = data; return res; }
};

// --- CENÁRIO: VALIDAR EXIBIÇÃO DE METADADOS ---
Given('eu acesso o sistema como {string}', function (role) {
  controller = new MovieController();
});

When('eu seleciono o filme {string}', async function (movieTitle) {
  req.params.moviesID = 'mocked-id';
  
  // Mapeia respostas lógicas simulando o comportamento de negócio do Service
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
  // expectedRows conterá uma lista de objetos [{ campo: 'título', valor: 'Metropolis' }, ...]
  
  expectedRows.forEach((row: any) => {
    // Normaliza acentuações para cruzar com as propriedades mapeadas no mock
    const fieldMap: any = { 'título': 'title', 'gêneros': 'generos', 'duração': 'duracao' };
    const fieldKey = fieldMap[row.campo] || row.campo;
    
    assert.strictEqual(responseData[fieldKey], row.valor);
  });
  
  mock.restoreAll(); // Limpa as interceptações após as validações
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
  // Apenas dispara o fluxo caso seja a requisição de metadados (10s)
  if (timeString === "10 segundos") {
    req.params.moviesID = 'id-lento';
    await controller.show(req, res);
  }
});

Then('o carregamento de metadados é interrompido', function () {
  assert.strictEqual(statusCode, 408);
});

Then('eu vejo a mensagem de erro {string}', function (expectedMessage) {
  assert.strictEqual(responseData.message, expectedMessage);
  mock.restoreAll();
});

Then('eu continuo na página {string} do filme {string}', function (pageName, movieTitle) {
  // Frontend
});