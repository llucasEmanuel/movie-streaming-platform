import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation-service';

const recommendationService = new RecommendationService();

export class RecommendationController {
  
  // Trata a rota /recommendations/
  async handleAllRecommendations(request: Request, response: Response): Promise<Response> {
    try {

      //TEMPORÁRIO: Abre o Prisma Studio, copia o ID de um usuário seu e cola aqui:
      //const idFixoDeTeste = "COLE_AQUI_UM_UUID_DE_USUARIO_DO_SEU_BANCO";
      //const userId = idFixoDeTeste;
    
      // Comente a linha abaixo quando quiser testar no navegador(falta testar quando tiver com a feature dos usuarios para ele puxar o id):
      const userId = (request as any).user?.id || (request.headers['x-test-user-id'] as string);
      

      if (!userId) {
        return response.status(401).json({ error: 'Usuário não autenticado ou ID ausente.' });
      }

      const allRecommendations = await recommendationService.getAllRecommendations(userId);
      return response.status(200).json(allRecommendations);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro ao compilar o pacote completo.' });
    }
  }

  // Trata a rota /recommendations/genres/:userId
  async handleGenres(request: Request, response: Response): Promise<Response> {
    try {
      const userId = request.params.userId as string;

      if (!userId) {
        return response.status(400).json({ error: 'O ID do usuário é obrigatório.' });
      }

      // Chama a lógica de gênero do Service
      const recommendations = await recommendationService.getGenreRecommendations(userId);
      return response.status(200).json(recommendations);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro no motor de recomendações por gênero.' });
    }
  }

  // Trata a rota /recommendations/trending
  async handleTrending(request: Request, response: Response): Promise<Response> {
    try {
      // Chama a lógica de populares pura do Service
      const trending = await recommendationService.getTrendingMovies();
      return response.status(200).json(trending);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro ao buscar tendências.' });
    }
  }

  // Trata a rota /recommendations/similar/:movieId
  async handleSimilar(request: Request, response: Response): Promise<Response> {
    try {
      const movieId = request.params.movieId as string;
      const userId = request.params.userId as string;
      if (!movieId) {
        return response.status(400).json({ error: 'O ID do filme é obrigatório.' });
      }

      const similarMovies = await recommendationService.getSimilarMovies(movieId,userId);
      return response.status(200).json(similarMovies);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro ao buscar filmes similares.' });
    }
  }
}