import "dotenv/config";
import express, { Request, Response } from "express";
import { recommendationRoutes } from "./routes/recommendation-routes";
import userRoutes from "./routes/routes";
import { router as movieRoutes } from "./routes/movie-routes";

export const app = express();

app.use(express.json());

// Registrando as rotas de usuários (Cadastro, etc)
app.use(userRoutes);

// Registrando as rotas de filmes
app.use("/", movieRoutes);

// Rotas quando a URL começar com /recommendations
app.use("/recommendations", recommendationRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Movie Streaming API is running" });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000 🚀");
  });
}
