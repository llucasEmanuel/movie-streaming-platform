import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation-service';

const recommendationService = new RecommendationService();

export class RecommendationController {
  
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

      if (!movieId) {
        return response.status(400).json({ error: 'O ID do filme é obrigatório.' });
      }

      const similarMovies = await recommendationService.getSimilarMovies(movieId);
      return response.status(200).json(similarMovies);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Erro ao buscar filmes similares.' });
    }
  }
}