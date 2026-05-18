import { MovieModel } from "../models/movie-model";
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

// Por enquanto, todas as buscas estão ocorrendo pelo título do filme, mas irá mudar no futuro.

export const createMovieService = async (
  movie: Omit<MovieModel, "id" | "createdAt" | "isDeleted">,
) => {
  // Aqui é necessário verificar se há algum campo da requisição que não foi preenchido
  const { title, synopsis, genres, duration, url_movie, url_poster } = movie;

  if (genres.length === 0) {
    //
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
  // Verifica se há algum título antes de tentar fazer a atualização
  if (!id || id.trim() === "") {
    throw new ValidationError("ID do filme deve ser informado");
  }

  // Verificando se o filme já está cadastrado na plataforma
  if (updates.title) {
    const data = await getAllMovies();
    const alreadyExists = data.some(
      (movieInfo) => movieInfo.title === updates.title && movieInfo.id !== id,
    );

    if (alreadyExists) {
      throw new ConflictError(
        "Não é possível fazer essa atualização. Já existe um filme com esse nome",
      );
    }
  }

  const updatedMovie = await updateMovie(id, updates);

  if (!updatedMovie) {
    throw new NotFoundError("Não foi possível atualizar. Filme não encontrado");
  }

  return updatedMovie;
};
