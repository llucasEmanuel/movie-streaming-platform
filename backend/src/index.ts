import "dotenv/config";
import express, { Request, Response } from 'express';
import { recommendationRoutes } from './routes/recommendation-routes';
import userRoutes from './routes/routes'; 
import { router as movieRoutes } from './routes/movie-routes';

const app = express();

// Middleware para aceitar JSON no body das requisições
app.use(express.json());

// Registrando as rotas de usuários (Cadastro, etc)
app.use(userRoutes);

// Registrando as rotas de filmes
app.use("/", movieRoutes);

// Rotas quando a URL começar com /recommendations
app.use('/recommendations', recommendationRoutes);

// Rota principal de verificação da API
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Movie Streaming API is running" });
});

// Iniciando o servidor
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000 🚀");
});