import { Request, Response } from "express";
import { MovieService } from "../services/movie-service";

export class MovieController {
    async show(req: Request, res: Response) {
        const { moviesID } = req.params;

        // Verifica se o ID realmente é uma string única
        if (typeof moviesID !== "string") {
            return res.status(400).json({ message: "Invalid movie ID." });
        }

        try {
            const movieService = new MovieService();
            const metadata = await movieService.getMetadata(moviesID);
            return res.json(metadata);
        } catch (error) {
            return res.status(404).json({ message: "Movie not found." });
        }
    }
}