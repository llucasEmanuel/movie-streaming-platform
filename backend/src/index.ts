import "dotenv/config";
import express, { Request, Response } from "express";
import { recommendationRoutes } from "./routes/recommendation-routes";
import userRoutes from "./routes/routes";
import { router as movieRoutes } from "./routes/movie-routes";
import { router as playlistRouter } from "./routes/playlist-route";

const app = express();

// Middleware para aceitar JSON no body das requisições
app.use(express.json());

// Registrando as rotas de usuários 
app.use("/api", userRoutes);

// Registrando as rotas de filmes
app.use("/", movieRoutes);

// Registrando as rotas de playlists
app.use("/", playlistRouter);

// Rotas quando a URL começar com /recommendations
app.use("/recommendations", recommendationRoutes);

// Rota principal de verificação da API
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Movie Streaming API is running" });
});

// Iniciando o servidor APENAS se não estivermos em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
  });
}

// Exportando o app para que o Supertest possa acessá-lo nos testes
export default app;
