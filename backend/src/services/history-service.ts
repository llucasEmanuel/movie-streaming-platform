import historyRepository from '../repositories/history-repository';
import { HistoryModel } from '../models/history-model';
import {MovieRepository} from '../repositories/movie-repository';

class HistoryService {
  private movieRepository = new MovieRepository();

  async processVideoProgress(id_user: string, id_movie: string, last_position: number) {
    const movie = await this.movieRepository.findById(id_movie);
  
  if (!movie) {
    throw new Error("Filme não encontrado");
  }

  const movieDuration = parseInt(movie.duration ?? "", 10) || 0;

  const percentageWatched = movieDuration > 0 
    ? (last_position / movieDuration) * 100 
    : 0;
    const is_completed = percentageWatched >= 95; 
    const today = new Date().toISOString().split('T')[0];

    const historyData: HistoryModel = {
      id_user,
      id_movie,
      watched_at: today,
      last_position,
      is_completed,
      is_hidden: false
    };
    return await historyRepository.upsert(historyData);
  }

  async hideAllFromHistory(id_user: string) {
    const currentHistory = await historyRepository.getUserHistory(id_user);
    if (currentHistory.length === 0) {
      throw new Error("Seu histórico já está vazio."); 
    }
    await historyRepository.hideAllFromHistory(id_user);
  }

  async hideMovie(id_user: string, id_movie: string, watched_at: Date) {
    await historyRepository.hideFromHistory(id_user, id_movie, watched_at);
  }

  async showUserHistory(id_user: string) {
     const history = await historyRepository.getUserHistory(id_user);

     return history.map(record => {
       const justTheDate = record.watchedAt.toISOString().split('T')[0];
       return {
         ...record,
         title: record.movie.title,
         watched_at: justTheDate,
       };
     });
  }

  async showUnfinishedMovies(id_user: string) {
  const history = await historyRepository.getUserHistory(id_user);

  const seenMovies = new Set<string>();
  const unfinishedMovies = [];

  for (const record of history) {
    if (seenMovies.has(record.movieId)) {
      continue;
    }

    seenMovies.add(record.movieId);

    if (!record.is_completed) {
      
      // Convertendo a string para inteiro 
      const movieDuration = parseInt(record.movie?.duration ?? "", 10) || 0;
      
      // Calculando a porcentagem
      const percentage = movieDuration > 0 
        ? Math.round((record.last_position / movieDuration) * 100) 
        : 0;

      unfinishedMovies.push({
        movieId: record.movieId,
        title: record.movie.title,
        image: record.movie.img_url,
        progress_percentage: percentage,
      });
    }
  }

  return unfinishedMovies;
}
}

export default new HistoryService();