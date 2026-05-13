import express, { Request, Response } from "express";
import { router } from "./routes/movie-routes";

const app = express();
app.use(express.json());
app.use("/", router);

app.get("/", (req: Request, res: Response) => {
  res.json({ mensagem: "API funcionando!" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
