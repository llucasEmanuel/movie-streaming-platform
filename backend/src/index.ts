import "dotenv/config";
import express from "express";
import { router } from "./routes/movie-routes";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Movie Streaming API is running" });
});

// Todas as rotas de filmes começam com /movies
app.use("/", router);

app.listen(3000, () => console.log("Server is running!"));