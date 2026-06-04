// history-controller.ts
import { Request, Response } from 'express';
import historyService from '../services/history-service';

class HistoryController {

    async updateProgress(req: Request, res: Response) {
        try {
            const { id_user, id_movie, duration, last_position } = req.body;
            
            await historyService.processVideoProgress(id_user, id_movie, duration, last_position);
            
            return res.status(200).json({ message: "Progresso salvo com sucesso." });
        } catch (error: any) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message });
        }
    }

    async hideSingleMovie(req: Request, res: Response) {
        try {
            const { id_user, id_movie, watched_at } = req.body;
            
            const watchDate = new Date(watched_at);
            
            await historyService.hideMovie(id_user, id_movie, watchDate);
            
            return res.status(200).json({ message: "Filme removido do histórico." });
        } catch (error: any) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message });
        }
    }
    
    async hideAll(req: Request, res: Response) {
        try {
            const { id_user } = req.body;
            
            await historyService.hideAllFromHistory(id_user);
            
            return res.status(200).json({ message: "Histórico ocultado com sucesso." });
            
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getHistory(req: Request, res: Response) {
        try {
            const id_user = req.params.id_user || req.body.id_user;
            const history = await historyService.showUserHistory(id_user);

            if (history.length === 0) {
                return res.status(200).json({ 
                    message: "Seu histórico está vazio. Que tal começar a assistir algo?",
                    data: []
                });
            }

            return res.status(200).json({ data: history });
        } catch (error: any) {
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    }
}

export default new HistoryController();