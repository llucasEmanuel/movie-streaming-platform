import "dotenv/config";
import express, { Request, Response } from 'express';
import userRoutes from './routes/routes'; 
import { router as movieRoutes } from './routes/movie-routes';
import cors from 'cors'

const app = express();
app.use(cors())

app.use(express.json());

app.use(userRoutes);

app.use("/", movieRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Movie Streaming API is running" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});