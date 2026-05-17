import { Router } from "express";
import {
  MovieController,
  postMovie,
  getMovies,
  deleteMovie,
  patchMovie,
} from "../controllers/movie-controller";

const movieController = new MovieController();

export const router = Router();

router.post("/movies", postMovie);
router.get("/movies", getMovies);
router.patch("/movies/:title", patchMovie);
router.delete("/movies/:title", deleteMovie);
router.get("/movies/:moviesID", movieController.show)
