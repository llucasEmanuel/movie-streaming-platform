import Router from "express";
import { postMovie } from "../controllers/movie-controller";

const router = Router();

router.post("/movies", postMovie);
