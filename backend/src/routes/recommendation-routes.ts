import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation-controller';

const recommendationRoutes = Router();
const recommendationController = new RecommendationController();

//1. Rota principal
recommendationRoutes.get('/', recommendationController.handleAllRecommendations);

// 2. Rota para os Gêneros Mais Assistidos 
recommendationRoutes.get('/genres/:userId', recommendationController.handleGenres);

// 3. Rota para os Populares/Lançamentos 
recommendationRoutes.get('/trending', recommendationController.handleTrending);

// 4. Rota para filmes Similares a um filme específico
recommendationRoutes.get('/similar/:movieId', recommendationController.handleSimilar);

export { recommendationRoutes };