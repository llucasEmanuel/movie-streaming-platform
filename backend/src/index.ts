import "dotenv/config";
import express, { Request, Response } from 'express';
import userRoutes from './routes'; 
import { router as movieRoutes } from './routes/movie-routes';
import { router as accountRoutes } from './routes/account-routes';

const app = express();
app.use(express.json());

app.use(userRoutes);
app.use("/accounts", accountRoutes);
app.use("/", movieRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: "API funcionando!" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});