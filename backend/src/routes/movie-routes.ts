import { Router } from "express";
import {
  MovieController,
  postMovie,
  getMovies,
  deleteMovie,
  patchMovie,
} from "../controllers/movie-controller";

import { checkAuthToken, checkAdmin } from "../middlewares/authMiddleware";

const movieController = new MovieController();

export const router = Router();

// Rotas de criação, edição e remoção agora são restritas a administradores
router.post("/movies", checkAuthToken, checkAdmin, postMovie);
router.patch("/movies/:id", checkAuthToken, checkAdmin, patchMovie);
router.delete("/movies/:id", checkAuthToken, checkAdmin, deleteMovie);

// Rotas de busca e visualização continuam públicas
router.get("/movies", getMovies);

router.get("/movies/:moviesID", movieController.show)
router.get("/movies/:moviesID/video", movieController.streamVideo);

router.get("/movies/:moviesID/download", movieController.downloadMovie);
