import Router from "express";
import {
  postMovie,
  getMovies,
  deleteMovie,
  patchMovie,
} from "../controllers/movie-controller";

export const router = Router();

router.post("/movies", postMovie);
router.get("/movies", getMovies);
router.patch("/movies/:title", patchMovie);
router.delete("/movies/:title", deleteMovie);
