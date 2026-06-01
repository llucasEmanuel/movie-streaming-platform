import { test } from 'node:test';
import assert from 'node:assert';
import { MovieController } from './movie-controller';
import { prisma } from '../database/prisma-client';

let movieId: string;

const mockMovie = {
  title: 'Metropolis',
  synopsis: 'Numa cidade futurística...',
  genres: 'Drama, Ficção Científica',
  duration: '153 minutos',
  director: 'Fritz Lang',
  cast: 'Brigitte Helm, Alfred Abel, Gustav Fröhlich',
  file_name: 'https://archive.org/download/Metropolis_2012/Metropolis_2012_512kb.mp4',
  isPopular: false,
};

test.before(async () => {
  const createdMovie = await prisma.movie.create({ data: mockMovie });
  movieId = createdMovie.id;
});

test.after(async () => {
  await prisma.movie.deleteMany({ where: { id: movieId } });
  await prisma.$disconnect();
});

test('[MovieMetadata] integration - controller -> service -> repository retorna metadados corretamente', async () => {
  const controller = new MovieController();
  const req = { params: { moviesID: movieId } } as any;

  let statusCode = 200;
  let responseData: any;

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseData = data;
      return res;
    },
  } as any;

  await controller.show(req, res);

  assert.strictEqual(statusCode, 200);
  assert.deepStrictEqual(responseData, {
    id: movieId,
    title: mockMovie.title,
    synopsis: mockMovie.synopsis,
    genres: mockMovie.genres,
    duration: mockMovie.duration,
    director: mockMovie.director,
    cast: mockMovie.cast,
  });
});
