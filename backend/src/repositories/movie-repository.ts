import { MovieModel } from "../models/movie-model";
import { prisma } from "../database/prisma";
import { PrismaClient } from "../generated/prisma";
import { prisma as defaultPrisma } from "../database/prisma-client";

// Camada responsável pela interação com o banco de dados

export class MovieRepository {
  constructor(private prismaClient: PrismaClient = defaultPrisma) {}

  async findById(id: string) {
    return await this.prismaClient.movie.findUnique({ where: { id } });
  }

  async save(data: any) {
    return await this.prismaClient.movie.create({ data });
  }
}

export const getAllMovies = async (): Promise<MovieModel[]> => {
  return (await prisma.movie.findMany()).filter((movie) => !movie.isDeleted) as unknown as MovieModel[];
};

export const insertMovie = async (
  movie: Omit<MovieModel, "id" | "createdAt" | "isDeleted">,
) => {
  return await prisma.movie.create({
    data: movie as any,
  }) as unknown as MovieModel;
};

export const deleteMovie = async (id: string) => {
  const movie = await prisma.movie.findUnique({ where: { id } });

  if (movie) {
    await prisma.movie.update({ where: { id }, data: { isDeleted: true } });
    return true;
  }
  return false;
};

export const updateMovie = async (id: string, updates: Partial<MovieModel>) => {
  const movie = await prisma.movie.findUnique({ where: { id } });

  if (movie) {
    return await prisma.movie.update({
      where: { id },
      data: updates as any,
    }) as unknown as MovieModel;
  }
  return null;
};

export const findMovieByTitleOrUrl = async (
  title: string,
  urlMovie: string,
): Promise<MovieModel | null> => {
  return await prisma.movie.findFirst({
    where: {
      OR: [
        {
          title: {
            equals: title,
            mode: "insensitive", // Faz o banco ignorar maiúsculas/minúsculas nativamente
          },
        },
        {
          url_movie: urlMovie,
        },
      ],
    },
  }) as unknown as MovieModel | null;
};
