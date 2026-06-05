import historyRepository from '../repositories/history-repository';
import { HistoryModel } from '../models/history-model';

class HistoryService {

  async processVideoProgress(id_user: string, id_movie: string, duration: number, last_position: number) {
    const percentageWatched = (last_position / duration) * 100;
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
         watched_at: justTheDate,
       };
     });
  }
}

export default new HistoryService();