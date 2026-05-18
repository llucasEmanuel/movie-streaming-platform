import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: string;
}

export function verificarAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  //  Verifica se o cabeçalho de autorização foi enviado
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const parts = authHeader.split(" ");

  //  Garante que o cabeçalho possui duas partes e começa com "Bearer"
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token malformatado." });
  }

  const token = parts[1];

  try {
    // Valida o token com a chave secreta do .env
    const secret = process.env.JWT_SECRET || "sua-chave-secreta-do-projeto"; // Deixar assim por enquanto para testes
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Verifica se o cargo é adm ou nao
    if (decoded.role !== "administrador") {
      return res.status(403).json({
        message: "Acesso negado. Privilégios de administrador necessários.",
      });
    }

    // Se o usuário for administrador, o fluxo continua para o controller
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
