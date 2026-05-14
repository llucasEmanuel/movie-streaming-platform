import { MovieModel } from "../models/movie-model";
import { deleteMovie, getAllMovies, insertMovie, updateMovie } from "../repositories/movie-repository";
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from "../errors/errors";

export const getMoviesService = async () => {
  return getAllMovies();
};

