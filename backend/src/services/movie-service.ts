import { MovieModel } from "../models/movie-model";
import { deleteMovie, getAllMovies, insertMovie, updateMovie } from "../repositories/movie-repository";
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from "../errors/errors";

export const getMoviesService = async () => {
  return getAllMovies();
};

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

