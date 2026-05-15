import { MovieModel } from "../models/movie-model";
import {
  MovieRepository,
  deleteMovie,
  getAllMovies,
  insertMovie,
  updateMovie,
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
    const movie = await this.repository.findById(id); // <--- Chama o repositório

    if (!movie) throw new NotFoundError("Filme não encontrado");
    // 3. Aplicação dos seus cenários de Gherkin (Fallback de Título e N/A)
    return {
      id: movie.id,
      title: movie.title || "No title", // Scenario: Ausência de título
      synopsis: movie.synopsis || "N/A",      // Scenario: Ausência de metadados
      genres: movie.genres || "N/A",
      duration: movie.duration || "N/A",
      director: movie.director || "N/A",
      cast: movie.cast || "N/A"
    };
  }
}

// Por enquanto, todas as buscas estão ocorrendo pelo título do filme, mas irá mudar no futuro.

export const createMovieService = async (movie: MovieModel) => {
  // Aqui é necessário verificar se há algum campo da requisição que não foi preenchido
  const { title, synopsis, genres, duration, url_movie } = movie;

  if (genres.length === 0) {
    throw new BadRequestError("Necessário preencher os gêneros");
  }

  if (!title || title.trim() === "") {
    throw new BadRequestError("O título é obrigatório");
  }

  if (!url_movie || url_movie.trim() === "") {
    throw new BadRequestError("A URL do filme é necessária");
  }

  if (!duration) {
    throw new BadRequestError("A duração do filme é obrigatória");
  }

  if (!synopsis) {
    throw new BadRequestError("A sinopse do filme é obrigatória");
  }

  const data = await getAllMovies();

  // Verificando se o filme já está cadastrado na plataforma
  const alreadyExists = data.some(
    (movieInfo) => movieInfo.title === movie.title,
  );

  if (alreadyExists) {
    throw new ConflictError("Este filme já existe na base de dados");
  }
  // Verificar se a requisição veio completa, se sim, chamo o repositorie pra fazer a adição do filme no json e response created. Se não, retorno response badRequest()
  await insertMovie(movie);
  return movie;
};

export const getMoviesService = async () => {
  return getAllMovies();
};

export const deleteMovieService = async (title: string) => {
  if (!title || title.trim() === "") {
    throw new ValidationError("Título do filme deve ser informado");
  }
  const deleted = await deleteMovie(title);

  if (!deleted) {
    throw new NotFoundError(
      "Impossível excluir! Não existe esse filme na base de dados",
    );
  }
};

export const updateMovieService = async (
  title: string,
  updates: Partial<MovieModel>,
) => {
  // Verifica se há algum título antes de tentar fazer a atualização
  if (!title || title.trim() === "") {
    throw new ValidationError("Título do filme deve ser informado");
  }

  // Verificando se o filme já está cadastrado na plataforma
  if (updates.title) {
    const data = await getAllMovies();
    const alreadyExists = data.some(
      (movieInfo) => movieInfo.title === updates.title,
    );

    if (alreadyExists) {
      throw new ConflictError(
        "Não é possível fazer essa atualização. Já existe um filme com esse nome",
      );
    }
  }

  const updatedMovie = await updateMovie(title, updates);

  if (!updatedMovie) {
    throw new NotFoundError("Não foi possível atualizar. Filme não encontrado");
  }

  return updatedMovie;
};
