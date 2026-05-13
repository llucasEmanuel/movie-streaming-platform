import { Request, Response } from "express";
import {
  createMovieService,
  getMoviesService,
} from "../services/movie-service";

export const postMovie = async (req: Request, res: Response) => {
  const infoMovie = req.body;
  const httpResponse = await createMovieService(infoMovie);

  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getMovies = async (req: Request, res: Response) => {
  const httpResponse = await getMoviesService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};
