import "dotenv/config";
import express, { Request, Response } from 'express';
import userRoutes from './routes/user_signUP_routes'; 
import { router as movieRoutes } from './routes/movie-routes';

const app = express();

app.use(express.json());

app.use(userRoutes);

app.use("/", movieRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Movie Streaming API is running" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});