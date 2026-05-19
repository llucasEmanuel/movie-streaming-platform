import { Request, Response } from "express";
import { MovieModel } from "../models/movie-model";
import {
  MovieService,
  createMovieService,
  deleteMovieService,
  getMoviesService,
  updateMovieService,
} from "../services/movie-service";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";

export class MovieController {
    async show(req: Request, res: Response) {
        const { moviesID } = req.params;

        // Verifica se o ID realmente é uma string única
        if (typeof moviesID !== "string") {
            return res.status(400).json({ message: "Invalid movie ID." });
        }

        try {
            const movieService = new MovieService();
            const metadata = await movieService.getMetadata(moviesID);
            return res.json(metadata);
        } catch (error: any) {
            return res.status(404).json({ message: error.message });
        }
    }
}

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

export const getMovies = async (req: Request, res: Response) => {
  try {
    const allMovies = await getMoviesService();
    res.status(200).json(allMovies); // Retorna todos os filmes
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await deleteMovieService(id);
    const allMovies = await getMoviesService();
    res.status(200).json(allMovies); // Será removido no futuro, mas apenas para verificar momentaneamente que a exclusão ocorreu bem
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro inesperado" });
  }
};

export const patchMovie = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;
    const movieUpdated = await updateMovieService(id, updates);
    res.status(200).json(movieUpdated); // Retorna todas as informações referentes ao filme
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro inesperado" });
  }
};

