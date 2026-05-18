import Router from "express";
import {
  postMovie,
  getMovies,
  deleteMovie,
  patchMovie,
} from "../controllers/movie-controller";
import { verificarAdmin } from "../middlewares/auth-middleware";

export const router = Router();

router.get("/movies", getMovies);

router.post("/movies", verificarAdmin, postMovie);
router.patch("/movies/:id", verificarAdmin, patchMovie);
router.delete("/movies/:id", verificarAdmin, deleteMovie);
