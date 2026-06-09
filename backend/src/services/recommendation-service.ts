import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// CONSTANTES ADICIONADAS
const DIAS_HISTORICO_RECENTE = 7;
const MINIMO_FILMES_PARA_RECOMENDAR = 3;
const LIMITE_FILMES= 10;

export class RecommendationService {
  
  // LÓGICA PARA A ROTA /recommendations/
  async getAllRecommendations(userId: string) {
    const ultimoRegistro = await prisma.history.findFirst({
      where: { 
        userId: userId,
        is_completed: true, 
        is_hidden: false
       },
      orderBy: { watchedAt: 'desc' },
    });

    const [generosResult, trendingResult] = await Promise.all([
      this.getGenreRecommendations(userId),
      this.getTrendingMovies()
    ]);

    const secoes = [];

    // 1. Sempre adiciona a seção de gêneros (personalizada ou fallback)
    if (generosResult) secoes.push(generosResult);
    
    // 2.SÓ ADICIONA A SEÇÃO DE SIMILARES SE O USUÁRIO REALMENTE TIVER HISTÓRICO!
    if (ultimoRegistro) {
      const similarResult = await this.getSimilarMovies(ultimoRegistro.movieId,userId);
      // Garante que só joga na tela se o banco realmente achou filmes similares
      if (similarResult && similarResult.movies.length > 0) {
        secoes.push(similarResult);
      }
    }
    
    // 3. Sempre adiciona os populares no final
    if (trendingResult && generosResult?.sectionTitle !== "Lançamentos e Populares"){
      secoes.push(trendingResult);
    }

    return secoes;
  }

  // LÓGICA PARA A ROTA /recommendations/trending
  async getTrendingMovies() {
    const filmesPopulares = await this.fetchPopularMovies();

    return {
      sectionTitle: "Lançamentos e Populares",
      movies: filmesPopulares
    };
  }

  // LÓGICA PARA A ROTA /recommendations/genres/:userId
  async getGenreRecommendations(userId: string) {

    const historicoRecente = await this.getRecentHistory(userId);

    // Se não tem histórico recente, sugere os lançamentos e populares
    if (historicoRecente.length === 0) {
      const filmesPopulares = await this.fetchPopularMovies();
      return {
        sectionTitle: "Lançamentos e Populares",
        movies: filmesPopulares,
        message: "Assista mais conteúdos para melhorar suas recomendações"
      };
    }

    const { generoFavorito, maiorContagem } = this.identificarGeneroFavorito(historicoRecente);

    // Regra dos 3 filmes mínimos
    if (maiorContagem < MINIMO_FILMES_PARA_RECOMENDAR) {
      const todosOsFilmes = await prisma.movie.findMany({ 
        where: { isDeleted:{not:true}},
        take: LIMITE_FILMES
      }); 
      return {
        sectionTitle: "Explorar catálogo",
        message: "Assista mais conteúdos para melhorar suas recomendações",
        movies: todosOsFilmes,
      };
    }

    const idsFilmesAssistidos = historicoRecente.map(h => h.movieId);
    const recomendacoesGenero = await prisma.movie.findMany({
      where: {
        genres: generoFavorito,
        id: { notIn: idsFilmesAssistidos },
        isDeleted:{not:true}
      },
      take: LIMITE_FILMES
    });

    return {
      sectionTitle: `Recomendações de ${generoFavorito}`,
      movies: recomendacoesGenero,
    };
  }

  // LÓGICA PARA A ROTA /recommendations/similar/:movieId
  async getSimilarMovies(movieId: string, userId: string) {
    // 1. Busca o filme atual para saber o gênero dele
    const filmeAtual = await prisma.movie.findUnique({
      where: { id: movieId }
    });

    // Se o filme sumiu ou o ID é inválido, aplica o plano B de retornar filmes populares
    if (!filmeAtual) {
    const filmesPopulares = await this.fetchPopularMovies();
    
    return {
      sectionTitle: "Você também pode gostar", // Um título genérico seguro
      movies: filmesPopulares
    };
  }

    // 2. Busca os IDs dos filmes que este usuário específico já assistiu por completo
    const historicoRecente = await this.getRecentHistory(userId);

    // Extrai os IDs para um array simples de strings
    const idsFilmesAssistidos = historicoRecente.map(h => h.movieId);

    // 3. Busca filmes similares excluindo o atual E os que ele já completou
    const filmesSimilares = await prisma.movie.findMany({
      where: {
        genres: filmeAtual.genres,
        id: {
          notIn: [movieId, ...idsFilmesAssistidos] // "notIn" exclui o atual E todos os já vistos
        },
        isDeleted: { not: true }
      },
      take: LIMITE_FILMES
    });

    return {
      sectionTitle: `Porque você assistiu ${filmeAtual.title}`,
      movies: filmesSimilares
    };
  }

  private async fetchPopularMovies() {
    return await prisma.movie.findMany({
      where: { 
        isPopular: true,
        isDeleted: { not: true } 
      },
      take: LIMITE_FILMES
    });
  }

  private identificarGeneroFavorito(historico: any[]) {
    const contagemGeneros: Record<string, number> = {};
    const filmesContados = new Set<string>();

    historico.forEach(registro => {
      if (!filmesContados.has(registro.movieId)) {
        filmesContados.add(registro.movieId);
        const genero = registro.movie.genres;
        contagemGeneros[genero] = (contagemGeneros[genero] || 0) + 1;
      }
    });

    let generoFavorito = "";
    let maiorContagem = 0;
    for (const [genero, quantidade] of Object.entries(contagemGeneros)) {
      if (quantidade > maiorContagem) {
        maiorContagem = quantidade;
        generoFavorito = genero;
      }
    }

    return { generoFavorito, maiorContagem };
  }

  private calcularDataLimite(dias: number): Date {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  }

  private async getRecentHistory(userId: string) {
    const dataLimite = this.calcularDataLimite(DIAS_HISTORICO_RECENTE);

    return await prisma.history.findMany({
      where: {
        userId: userId,
        watchedAt: { gte: dataLimite },
        is_completed: true,
        is_hidden: false
      },
      include: { 
        movie: true 
      }
    });
  }

}