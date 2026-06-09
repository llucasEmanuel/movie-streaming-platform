import { MovieModel } from "../models/movie-model";
import { PrismaClient } from "../generated/prisma";
import { prisma } from "../database/prisma-client";

// Camada responsável pela interação com o banco de dados

export class MovieRepository {
  constructor(private prismaClient: PrismaClient = prisma) { }

  // Seleciona do BD pelo ID (uuid)
  async findById(id: string) {
    return await this.prismaClient.movie.findUnique({ where: { id } });
  }

  // Salva filme no BD
  async save(data: any) {
    return await this.prismaClient.movie.create({ data });
  }
}

export const getAllMovies = async (search?: string, genre?: string): Promise<MovieModel[]> => {
  // Busca todos os filmes e já filtra os deletados
  const allMovies = (await prisma.movie.findMany()).filter((movie: any) => !movie.isDeleted);

  // Se o usuário não passou nenhum filtro, retorna tudo direto
  if (!search && !genre) {
    return allMovies as unknown as MovieModel[];
  }

  // Normaliza os termos de busca para minúsculo
  const searchLower = search?.toLowerCase();
  const genreLower = genre?.toLowerCase();

  // Filtra a lista na memória
  return allMovies.filter((movie: any) => {

    // Filtro Ícone de Gênero
    let matchesGenre = true;
    if (genreLower) {
      // Verifica se existe o gênero (não é nulo) e se a string contém o gênero buscado
      matchesGenre = movie.genres ? movie.genres.toLowerCase().includes(genreLower) : false;
    }

    // Filtro Barra de Pesquisa Global
    let matchesSearch = true;
    if (searchLower) {
      const titleMatch = movie.title ? movie.title.toLowerCase().includes(searchLower) : false;
      const directorMatch = movie.director ? movie.director.toLowerCase().includes(searchLower) : false;
      const castMatch = movie.cast ? movie.cast.toLowerCase().includes(searchLower) : false;
      const genreMatch = movie.genres ? movie.genres.toLowerCase().includes(searchLower) : false;

      matchesSearch = titleMatch || directorMatch || castMatch || genreMatch;
    }

    return matchesGenre && matchesSearch;
  }) as unknown as MovieModel[];
};
export const insertMovie = async (movie: any) => {
  return await prisma.movie.create({
    data: {
      title: movie.title,
      synopsis: movie.synopsis,
      // Fazendo a ponte do nome do front para o nome do banco
      file_name: movie.url_movie,

      // O banco espera strings, mas o front manda arrays/números, então convertemos:
      duration: movie.duration ? String(movie.duration) : null,
      genres: Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres,
      director: Array.isArray(movie.director) ? movie.director.join(", ") : movie.director,
      cast: Array.isArray(movie.cast) ? movie.cast.join(", ") : movie.cast,
      img_url: movie.url_poster
    }
  });
};

export const deleteMovie = async (id: string) => {
  const movie = await prisma.movie.findUnique({ where: { id } });

  if (movie) {
    await prisma.movie.update({ where: { id }, data: { isDeleted: true } });
    return true;
  }
  return false;
};

export const updateMovie = async (id: string, updates: any) => {
  const movie = await prisma.movie.findUnique({ where: { id } });

  if (movie) {
    const dataToUpdate: any = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title;
    if (updates.synopsis !== undefined) dataToUpdate.synopsis = updates.synopsis;
    if (updates.url_movie !== undefined) dataToUpdate.file_name = updates.url_movie;
    if (updates.duration !== undefined) dataToUpdate.duration = updates.duration ? String(updates.duration) : null;
    if (updates.genres !== undefined) dataToUpdate.genres = Array.isArray(updates.genres) ? updates.genres.join(", ") : updates.genres;
    
    // Tratando o caso do diretor que pode vir como director (Frontend atual) ou directors
    if (updates.director !== undefined) dataToUpdate.director = Array.isArray(updates.director) ? updates.director.join(", ") : updates.director;
    else if (updates.directors !== undefined) dataToUpdate.director = Array.isArray(updates.directors) ? updates.directors.join(", ") : updates.directors;
    
    if (updates.cast !== undefined) dataToUpdate.cast = Array.isArray(updates.cast) ? updates.cast.join(", ") : updates.cast;
    if (updates.url_poster !== undefined) dataToUpdate.img_url = updates.url_poster;
    if (updates.isPopular !== undefined) dataToUpdate.isPopular = updates.isPopular;

    return await prisma.movie.update({
      where: { id },
      data: dataToUpdate,
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
          file_name: urlMovie,
        },
      ],
    },
  }) as unknown as MovieModel | null;
};
