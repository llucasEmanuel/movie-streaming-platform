import { PrismaClient } from "../generated/prisma";
import { prisma as defaultPrisma } from "../database/prisma-client";
import { MovieModel } from "../models/movie-model";

export class MovieRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string) {
    return await this.prisma.movie.findUnique({ where: { id } });
  }

  async save(data: any) {
    return await this.prisma.movie.create({ data });
  }
}

// Camada responsável pela interação com o data 

const database: MovieModel[] = [
  {
    id: 1,
    title: "Ayrton: O Legado das Pistas",
    synopsis:
      "Um mergulho na história e nas estatísticas das maiores lendas do automobilismo, explorando a precisão técnica necessária para vencer.",
    genres: ["Documentário", "Esportes"],
    duration: 105,
    url_movie: "https://seustreaming.com/videos/legado-pistas.mp4",
  },
  {
    id: 2,
    title: "Sobrevivência em Blocos",
    synopsis:
      "Aventureiros precisam dominar mecânicas de combate e construir defesas impenetráveis para proteger sua vila dos perigos que surgem à noite.",
    genres: ["Aventura", "Fantasia", "Ação"],
    duration: 90,
    url_movie: "https://seustreaming.com/videos/sobrevivencia-blocos.mp4",
  },
  {
    id: 3,
    title: "O Rugido da Ilha",
    synopsis:
      "A emocionante trajetória de um clube rubro-negro rumo a uma conquista histórica, embalada pela paixão incondicional de sua torcida.",
    genres: ["Documentário", "Drama"],
    duration: 120,
    url_movie: "https://seustreaming.com/videos/rugido-ilha.mp4",
  },
  {
    id: 4,
    title: "Domínio Territorial",
    synopsis:
      "Em uma disputa de proporções globais, estrategistas precisam calcular cada movimentação de tropas para conquistar continentes inteiros.",
    genres: ["Guerra", "Suspense"],
    duration: 145,
    url_movie: "https://seustreaming.com/videos/dominio-territorial.mp4",
  },
];

export const getAllMovies = async (): Promise<MovieModel[]> => {
  return database;
};

export const insertMovie = async (movie: MovieModel) => {
  database.push(movie);
};

export const deleteMovie = async (title: string) => {
  const index = database.findIndex((movie) => movie.title === title); // Busca o filme pelo título na base de dados

  if (index !== -1) {
    database.splice(index, 1); // Remove o filme encontrado
    return true;
  }

  return false;
};

export const updateMovie = async (
  title: string,
  updates: Partial<MovieModel>,
) => {
  const index = database.findIndex((movie) => movie.title === title);

  if (index !== -1) {
    database[index] = { ...database[index], ...updates }; // Atualiza as informações
    return database[index];
  }

  return null;
};
