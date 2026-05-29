import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export class RecommendationService {
  
  // LÓGICA PARA A ROTA /recommendations/trending
  async getTrendingMovies() {
    const filmesPopulares = await prisma.movie.findMany({
      where: { isPopular: true },
      take: 10,
    });

    return {
      sectionTitle: "Lançamentos e Populares",
      movies: filmesPopulares,
    };
  }

  // LÓGICA PARA A ROTA /recommendations/genres/:userId
  async getGenreRecommendations(userId: string) {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const historicoRecente = await prisma.history.findMany({
      where: {
        userId: userId,
        watchedAt: { gte: seteDiasAtras }
      },
      include: { movie: true }
    });

    // Se não tem histórico recente, sugere os lançamentos e populares
    if (historicoRecente.length === 0) {
      const filmesPopulares = await prisma.movie.findMany({ where: { isPopular: true }, take: 10 });
      return {
        sectionTitle: "Lançamentos e Populares",
        movies: filmesPopulares,
        message: "Assista mais conteúdos para melhorar suas recomendações"
      };
    }

    const contagemGeneros: Record<string, number> = {};
    historicoRecente.forEach(registro => {
      const genero = registro.movie.genres;
      contagemGeneros[genero] = (contagemGeneros[genero] || 0) + 1;
    });

    let generoFavorito = "";
    let maiorContagem = 0;
    for (const [genero, quantidade] of Object.entries(contagemGeneros)) {
      if (quantidade > maiorContagem) {
        maiorContagem = quantidade;
        generoFavorito = genero;
      }
    }

    // Regra dos 3 filmes mínimos
    if (maiorContagem < 3) {
      return {
        message: "Assista mais conteúdos para melhorar suas recomendações",
        sectionTitle: `Recomendações de ${generoFavorito}`,
        movies: [],
      };
    }

    const idsFilmesAssistidos = historicoRecente.map(h => h.movieId);
    const recomendacoesGenero = await prisma.movie.findMany({
      where: {
        genres: generoFavorito,
        id: { notIn: idsFilmesAssistidos }
      },
      take: 5
    });

    return {
      sectionTitle: `Recomendações de ${generoFavorito}`,
      movies: recomendacoesGenero,
    };
  }

  // LÓGICA PARA A ROTA /recommendations/similar/:movieId
  async getSimilarMovies(movieId: string) {
    // 1. Busca o filme atual para saber o gênero dele
    const filmeAtual = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    // Se o filme não existir no banco, retorna um aviso
    if (!filmeAtual) {
      return {
        sectionTitle: "Filmes Similares",
        movies: []
      };
    }

    // 2. Busca filmes do mesmo gênero, excluindo o filme atual da lista
    const filmesSimilares = await prisma.movie.findMany({
      where: {
        genres: filmeAtual.genres,
        id: {
          not: movieId // "not" diz ao Prisma: traga todos MENOS este ID
        }
      },
      take: 5 // Limita a barra lateral em até 5 recomendações
    });

    return {
      sectionTitle: `Porque você assistiu ${filmeAtual.title}`,
      movies: filmesSimilares
    };
  }

}