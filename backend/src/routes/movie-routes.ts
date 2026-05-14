import { Router } from "express";
import { MovieController } from "../controllers/movie-controller";

const movieRoutes = Router();
const movieController = new MovieController();

// A rota captura o ID que você definiu no PR
movieRoutes.get('/:moviesID', movieController.show);

export { movieRoutes };