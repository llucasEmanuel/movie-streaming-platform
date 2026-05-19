import { MovieModel } from "../models/movie-model";
import {
import { MovieRepository } from "../repositories/movie-repository";
import {
  deleteMovie,
  getAllMovies,
  insertMovie,
  updateMovie,
  findMovieByTitleOrUrl,
} from "../repositories/movie-repository";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";

export class MovieService {
  private repository = new MovieRepository();

  async getMetadata(id: string) {
    const movie = await this.repository.findById(id);

    if (!movie) throw new NotFoundError("Filme não encontrado");
    return {
      id: movie.id,
      title: movie.title || "No title",
      synopsis: movie.synopsis || "N/A",
      genres: movie.genres || "N/A",
      duration: movie.duration || "N/A",
      director: movie.director || "N/A",
      cast: movie.cast || "N/A"
    };
  }
}

// Por enquanto, todas as buscas estão ocorrendo pelo título do filme, mas irá mudar no futuro.

export const createMovieService = async (
  movie: Omit<MovieModel, "id" | "createdAt" | "isDeleted">,
) => {
  // Aqui é necessário verificar se há algum campo da requisição que não foi preenchido
  const { title, synopsis, genres, duration, url_movie, url_poster } = movie;

  if (genres.length === 0) {
    throw new BadRequestError("Necessário preencher os gêneros");
  }

  if (!title || title.trim() === "") {
    throw new BadRequestError("O título é obrigatório");
  }

  if (!url_movie || url_movie.trim() === "") {
    throw new BadRequestError("A URL do filme é necessária");
  }

  // Verifica se a url do filme é válida

  try {
    const parsedUrl = new URL(url_movie);

    if (parsedUrl.protocol !== "https:") {
      throw new BadRequestError(
        "A URL do filme deve utilizar uma conexão segura",
      );
    }

    if (!parsedUrl.hostname.endsWith("archive.org")) {
      throw new BadRequestError("Origem do vídeo não autorizada");
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    throw new BadRequestError("A URL fornecida possui formato inválido");
  }

  // Verifica se a duração foi preenchida
  if (!duration) {
    throw new BadRequestError("A duração do filme é obrigatória");
  }

  // Verifica se há poster

  if (!url_poster) {
    throw new BadRequestError("O poster do filme é obrigatório");
  }

  // Verifica se há sinopse
  if (!synopsis) {
    throw new BadRequestError("A sinopse do filme é obrigatória");
  }

  const alreadyExists = await findMovieByTitleOrUrl(title, url_movie);

  if (alreadyExists) {
    throw new ConflictError("Este filme já existe na base de dados");
  }
  // Verificar se a requisição veio completa, se sim, chamo o repositorie pra fazer a adição do filme no json e response created. Se não, retorno response badRequest()

  // Arrays cast e directors são opcionais
  const createdMovie = await insertMovie(movie);
  return createdMovie;
};

export const getMoviesService = async () => {
  return getAllMovies();
};

export const deleteMovieService = async (id: string) => {
  if (!id || id.trim() === "") {
    throw new ValidationError("ID do filme deve ser informado");
  }
  const deleted = await deleteMovie(id);

  if (!deleted) {
    throw new NotFoundError(
      "Impossível excluir! Não existe esse filme na base de dados",
    );
  }
};

export const updateMovieService = async (
  id: string,
  updates: Partial<MovieModel>,
) => {
  //  Verifica se o ID original da rota foi fornecido
  if (!id || id.trim() === "") {
    throw new ValidationError("ID do filme deve ser informado");
  }

  // Impede a tentativa de alteração do ID via payload
  if (updates.id && updates.id !== id) {
    throw new ValidationError(
      "Não é permitido alterar o ID de um filme existente",
    );
  }

  // Impede que o título seja alterado para um texto vazio/em branco
  if (updates.title !== undefined && updates.title.trim() === "") {
    throw new ValidationError(
      "O título do filme é obrigatório e não pode ficar em branco",
    );
  }

  // Verifica se é desejado atualização na url_movie ou no título, para verificarmos se já tem algum filme no BD com esses dados de atualização
  if (updates.title || updates.url_movie) {
    const titleToCheck = updates.title || "";
    const urlToCheck = updates.url_movie || "";

    const conflictingMovie = await findMovieByTitleOrUrl(
      titleToCheck,
      urlToCheck,
    );

    // Se encontrou um filme no banco E o ID desse filme for diferente do que estamos editando
    if (conflictingMovie && conflictingMovie.id !== id) {
      // Checa se o conflito foi no título
      if (
        updates.title &&
        conflictingMovie.title.toLowerCase() === updates.title.toLowerCase()
      ) {
        throw new ConflictError(
          "Não é possível fazer essa atualização. Já existe um filme com esse título",
        );
      }

      // Checa se o conflito foi na URL
      if (
        updates.url_movie &&
        conflictingMovie.url_movie.toLowerCase() ===
          updates.url_movie.toLowerCase()
      ) {
        throw new ConflictError(
          "Não é possível fazer essa atualização. Já existe um filme com essa URL",
        );
      }
    }
  }

  // Garantindo que não haverá atualizações do ID
  delete updates.id;

  const updatedMovie = await updateMovie(id, updates);

  if (!updatedMovie) {
    throw new NotFoundError("Não foi possível atualizar. Filme não encontrado");
  }

  return updatedMovie;
};
