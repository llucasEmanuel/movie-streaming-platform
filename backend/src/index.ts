import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: "API funcionando!" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});