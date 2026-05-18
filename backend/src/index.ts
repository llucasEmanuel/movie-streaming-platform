import express, { Request, Response } from "express";
import { router } from "./routes/movie-routes";

export const app = express();
app.use(express.json());
app.use("/", router);

app.get("/", (req: Request, res: Response) => {
  res.json({ mensagem: "API funcionando!" });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
  });
}
