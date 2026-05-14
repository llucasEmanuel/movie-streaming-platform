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

