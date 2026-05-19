import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { MovieController } from './movie-controller';
import { MovieService } from '../services/movie-service';

describe('MovieController - show', () => {

  test('[MovieMetadata] deve retornar metadados com sucesso', async () => {
    const mockMetadata = { id: '123', title: 'Inception' };
    
    // Mocka o método getMetadata
    const getMetadataMock = mock.method(MovieService.prototype, 'getMetadata', async () => {
      return mockMetadata;
    });

    const controller = new MovieController();
    
    const req = { params: { moviesID: '123' } } as any;
    let responseData = {};
    const res = {
      json: (data: any) => { responseData = data; return res; },
      status: (code: number) => res
    } as any;

    await controller.show(req, res);

    assert.deepStrictEqual(responseData, mockMetadata);
    assert.strictEqual(getMetadataMock.mock.callCount(), 1);

    // Limpa o mock após o teste
    getMetadataMock.mock.restore();
  });

  test('[MovieMetadata] deve retornar 404 quando o filme não for encontrado', async () => {
    const errorMessage = "Movie not found";
    mock.method(MovieService.prototype, 'getMetadata', async () => {
      throw new Error(errorMessage);
    });

    const controller = new MovieController();
    const req = { params: { moviesID: 'id-invalido' } } as any;
    
    let statusCode = 0;
    let responseData = {};
    
    const res = {
      status: (code: number) => { statusCode = code; return res; },
      json: (data: any) => { responseData = data; return res; }
    } as any;

    await controller.show(req, res);

    assert.strictEqual(statusCode, 404);
    assert.deepStrictEqual(responseData, { message: errorMessage });
    
    mock.restoreAll();
  });
});