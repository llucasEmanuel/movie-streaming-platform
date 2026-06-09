import { describe, it, expect, beforeAll } from 'vitest';
import { movieService } from '../../src/services/movieService';

describe('Integração Front-end -> Back-end (HTTP)', () => {
  
  beforeAll(() => {
    console.log("OBS: Certifique-se que o sistema está sendo executado");
    // Garante que o ambiente de teste consegue enxergar a API local
    if (!process.env.API_BASE_URL) {
      console.log('Rodando testes contra: http://localhost:3000');
    }
  });

  it('Deve disparar uma chamada HTTP GET para /movies e receber a lista do Backend', async () => {
    // Executa o método real
    const moviesList = await movieService.getAllMovies();

    expect(moviesList).toBeInstanceOf(Array);
    
    if (moviesList.length > 0) {
      const firstMovie = moviesList[0];
      expect(firstMovie).toHaveProperty('id');
      expect(firstMovie).toHaveProperty('title');
      expect(firstMovie).toHaveProperty('genres');
    }
  });

  it('Deve gerar a URL correta do player de streaming baseado no id do filme', () => {
    const mockId = 'fake-uuid-123';
    const expectedStreamUrl = 'http://localhost:3000/movies/fake-uuid-123/video';
    
    const generatedUrl = movieService.getVideoStreamUrl(mockId);
    
    expect(generatedUrl).toBe(expectedStreamUrl);
  });
});