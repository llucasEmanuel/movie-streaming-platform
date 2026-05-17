import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MovieRepository } from './movie-repository';
import { PrismaClient } from '@prisma/client';

describe('MovieRepository - findById', () => {

  test('[MovieMetadata] deve chamar prisma.movie.findUnique com o ID correto', async (t) => {
    const mockId = "42";
    const mockMovie = { id: mockId, title: "O Rugido da Ilha" };

    const prismaMock = {
      movie: {
        findUnique: t.mock.fn(async () => mockMovie),
        create: t.mock.fn(),
      },
    } as unknown as PrismaClient;

    const repo = new MovieRepository(prismaMock);
    const result = await repo.findById(mockId);

    assert.deepStrictEqual(result, mockMovie);
    assert.strictEqual(prismaMock.movie.findUnique.mock.calls.length, 1);
    assert.deepStrictEqual(prismaMock.movie.findUnique.mock.calls[0].arguments[0], {
      where: { id: mockId }
    });
  });

});