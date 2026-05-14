import "dotenv/config";
import express from "express";
import { movieRoutes } from "./routes/movie-routes";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Movie Streaming API is running" });
});

// Todas as rotas de filmes começam com /movies
app.use('/movies', movieRoutes);

app.listen(3000, () => console.log("Server is running!"));