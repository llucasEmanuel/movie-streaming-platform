import { HttpResponse } from "../models/httpResponse-model";

export const ok = async (data: any): Promise<HttpResponse> => {
  return {
    statusCode: 200,
    body: data,
  };
};

export const created = async (): Promise<HttpResponse> => {
  return {
    statusCode: 201,
    body: {
      message: "Filme adicionado com sucesso",
    },
  };
};

export const badRequest = async (): Promise<HttpResponse> => {
  return {
    statusCode: 400,
    body: "Objeto inválido",
  };
};

export const noContent = async (): Promise<HttpResponse> => {
  return {
    statusCode: 204,
    body: {
      message: "Não há filmes na base de dados",
    },
  };
};
