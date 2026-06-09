import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../src/database/prisma-client';
import { getAllMovies, MovieRepository } from '../../src/repositories/movie-repository';

describe('Integração Back-end -> Banco de Dados', () => {
  const repository = new MovieRepository();
  const testMovieId = 'b0ce4a3b-9bf8-468a-a43b-76b6d80ff123';

  // Limpa o ambiente antes de rodar os testes para evitar colisões
  beforeAll(async () => {
    await prisma.movie.deleteMany({ where: { id: testMovieId } });
  });

  // Fecha a conexão com o banco ao finalizar
  afterAll(async () => {
    await prisma.movie.deleteMany({ where: { id: testMovieId } });
    await prisma.$disconnect();
  });

  it('Deve persistir um novo filme diretamente no PostgreSQL usando o Repository', async () => {
    const newMovie = {
      id: testMovieId,
      title: 'Nosferatu (Test Integration)',
      file_name: 'https://archive.org/download/nosferatu/video.mp4',
      img_url: 'http://localhost/image.jpg',
      synopsis: 'Clássico do expressionismo alemão.',
      genres: 'Terror, Clássico',
      isPopular: true,
      duration: '94',
      director: 'F.W. Murnau',
      cast: 'Max Schreck',
      year: '1922'
    };

    const savedMovie = await repository.save(newMovie);
    
    expect(savedMovie).toBeTruthy();
    expect(savedMovie.title).toBe('Nosferatu (Test Integration)');
  });

  it('Deve buscar os filmes salvos no banco através do método getAllMovies', async () => {
    const moviesFromDb = await getAllMovies();
    
    // Verifica se a lista retornada contém o item inserido no teste anterior
    const findInserted = moviesFromDb.find(m => m.id === testMovieId);
    
    expect(moviesFromDb.length).toBeGreaterThan(0);
    expect(findInserted).toBeDefined();
    expect(findInserted?.director).toBe('F.W. Murnau');
  });
});