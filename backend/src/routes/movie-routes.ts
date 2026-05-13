import Router from "express";
import { postMovie, getMovies } from "../controllers/movie-controller";

export const router = Router();

router.post("/movies", postMovie);
router.get("/movies", getMovies);
