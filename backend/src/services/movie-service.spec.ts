import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { MovieService } from './movie-service';
import { MovieRepository } from '../repositories/movie-repository';

describe('MovieService - getMetadata', () => {

  test('[MovieMetadata] deve aplicar placeholders "No title" e "N/A" nos campos ausentes', async () => {
    const service = new MovieService();
    const mockId = "1";
    
    // Mock do método findById
    mock.method(MovieRepository.prototype, 'findById', async () => {
      return { 
        id: mockId, 
        title: null,
        synopsis: null, 
        genres: null,
        duration: null,
        director: null,
        cast: null,
      };
    });

    const result = await service.getMetadata(mockId);

    assert.strictEqual(result.title, "No title");
    assert.strictEqual(result.synopsis, "N/A");
    assert.strictEqual(result.director, "N/A");
  });

  test('[MovieMetadata] deve gerar um NotFoundError quando o repositório não encontra o filme', async () => {
    const service = new MovieService();
    mock.method(MovieRepository.prototype, 'findById', async () => null);

    await assert.rejects(
      async () => await service.getMetadata("id-inexistente"),
      { name: 'NotFoundError', message: 'Filme não encontrado' }
    );
  });
});