import { Request, Response } from "express";
import { createMovieService, deleteMovieService, getMoviesService, updateMovieService } from "../services/movie-service";
import { MovieModel } from "../models/movie-model";
import { BadRequestError, ConflictError, NotFoundError, ValidationError } from "../errors/errors";

export const getMovies = async (req: Request, res: Response) => {
  try {
    const allMovies = await getMoviesService();
    res.status(200).json(allMovies); // Retorna todos os filmes
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const postMovie = async (req: Request, res: Response) => {
  try {
    // Informações do filme novo que será inserido na plataforma viajam no corpo da nossa requisição
    const movie: MovieModel = req.body; // Por hora, o ID do filme cadastrado ainda está na requisição, apenas para testes
    const newMovie = await createMovieService(movie);

    res.status(201).json(newMovie); // Retorna o filme para mostrar que ele foi criado
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ConflictError) {
      return res.status(409).json({ message: error.message });
    }
  }
};

