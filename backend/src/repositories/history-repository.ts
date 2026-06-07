
import { HistoryModel } from "../models/history-model";
import { PrismaClient } from '../generated/prisma/client';
const prisma = new PrismaClient();

class HistoryRepository {

    async getUserHistory(id_user: string) {
        return await prisma.history.findMany({
            where: {
                userId: id_user,
                is_hidden: false
            },
            include: {
                movie: {
                    select: {
                        title: true,
                        duration: true,
                        img_url: true
                    },
                },
            },
            orderBy: {
                watchedAt: 'desc' // Ordena do mais recente para o mais antigo
            }
        });
    }
  
    async upsert(data: HistoryModel) {
        return await prisma.history.upsert({
            where: {
                userId_movieId_watchedAt: {
                    userId: data.id_user,
                    movieId: data.id_movie,
                    watchedAt: new Date(data.watched_at) 
                }
            },
            update: {
                // Se já existir hoje, atualiza a posição e o status
                last_position: data.last_position,
                is_completed: data.is_completed,
            },
            create: {
                // Se não existir hoje, cria uma nova
                userId: data.id_user,
                movieId: data.id_movie,
                watchedAt: new Date(data.watched_at),
                last_position: data.last_position,
                is_completed: data.is_completed,
                is_hidden: data.is_hidden
            }
        });
    }

    async hideAllFromHistory(id_user: string) {
        return await prisma.history.updateMany({
            where: {
                userId: id_user,
                is_hidden: false
            },
            data: {
                is_hidden: true
            }
        });
    }

    async hideFromHistory(id_user: string, id_movie: string, watched_at: Date) {
        return await prisma.history.update({
            where: {
                userId_movieId_watchedAt: {
                    userId: id_user,
                    movieId: id_movie,
                    watchedAt: watched_at
                }
            },
            data: {
                is_hidden: true
            }
        });
    }

    async getMovies(){
        return await prisma.movie.findMany();
    }
}

export default new HistoryRepository();