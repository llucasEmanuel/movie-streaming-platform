// history.routes.ts
import { Router } from "express";
import historyController from "../controllers/history-controller";

const historyRoutes = Router();

historyRoutes.get("/:id_user/unfinished", historyController.getUnfinishedMovies);
historyRoutes.get("/:id_user", historyController.getHistory);
historyRoutes.post("/progress", historyController.updateProgress);
historyRoutes.patch("/hide-movie", historyController.hideSingleMovie);
historyRoutes.patch("/hide-all", historyController.hideAll);

export default historyRoutes;