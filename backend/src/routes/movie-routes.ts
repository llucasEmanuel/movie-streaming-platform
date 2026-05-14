import Router from "express";
import { postMovie, getMovies, deleteMovie, patchMovie } from "../controllers/movie-controller";

export const router = Router();

router.get("/movies", getMovies);
