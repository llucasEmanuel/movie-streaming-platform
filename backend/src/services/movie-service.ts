import { MovieModel } from "../models/movie-model";
import { badRequest, ok, noContent } from "../utils/http-helper";
import { getAllMovies } from "../repositories/movie-repository";

export const createMovieService = async (infoMovie: MovieModel) => {
  let response = badRequest();

  // Verificar se a requisição veio completa, se sim, chamo o repositorie pra fazer a adição do filme no json e response created. Se não, retorno response badRequest()

  return response;
};

export const getMoviesService = async () => {
  const data = await getAllMovies();
  let response = null;

  if (data) {
    response = await ok(data);
  } else {
    response = await noContent();
  }

  return response;
};
