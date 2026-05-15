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

  async streamVideo(req: Request, res: Response) {
    const { moviesID } = req.params;
    const range = req.headers.range || "bytes=0-";

    try {
      const movieService = new MovieService();
      const movie = await movieService.getRawMovieData(String(moviesID));
      
      const videoUrl = movie.file_name; // ou url_movie

      if (!videoUrl) {
        return res.status(404).json({ message: "Video URL not registered" });
      }

      // O fetch do Node segue redirecionamentos automaticamente (follow redirects)
      const response = await fetch(videoUrl, {
        headers: {
          'Range': range
        }
      });

      // Repassa os cabeçalhos do Internet Archive para o navegador
      res.writeHead(response.status, {
        'Content-Type': response.headers.get('content-type') || 'video/mp4',
        'Content-Range': response.headers.get('content-range') || '',
        'Accept-Ranges': 'bytes',
        'Content-Length': response.headers.get('content-length') || '',
      });

      // Transforma o body do fetch em um stream do Node e faz o pipe para a resposta
      if (response.body) {
        const reader = response.body.getReader();
        
        // Função para ler o stream do vídeo
        const push = async () => {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            return;
          }
          res.write(Buffer.from(value));
          push();
        };
        
        push();
      } else {
        res.status(500).send("Unable to read movie stream");
      }

    } catch (error) {
      console.error("Streaming error:", error);
      return res.status(404).json({ message: "Movie not found" });
    }
  }

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
    const title = String(req.params.title);
    await deleteMovieService(title);
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
    const title = String(req.params.title);
    const updates = req.body;
    const movieUpdated = await updateMovieService(title, updates);
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

