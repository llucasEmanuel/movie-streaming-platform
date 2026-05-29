import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const DBUtils = {
    // Busca um usuário pelo e-mail ou o cria se não existir
    async garantirUsuario(email: string, name: string) {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: { email, name }
            });
        }
        return user;
    },

    // Limpa o histórico de um usuário específico
    async limparHistorico(userId: string) {
        await prisma.history.deleteMany({ where: { userId } });
    },

    // Garante que um filme único exista no banco
    async garantirFilmeUnico(nomeFilme: string) {
        let filme = await prisma.movie.findFirst({ where: { title: nomeFilme } });
        if (!filme) {
            filme = await prisma.movie.create({ 
                data: { title: nomeFilme, genres: "Geral", isPopular: false } 
            });
        }
        return filme;
    },

    // Cria filmes e insere no histórico para simular visualizações por gênero
    async garantirEAssistirFilmes(userId: string, qtd: string, genero: string) {
        const limite = parseInt(qtd);
        let filmes = await prisma.movie.findMany({ where: { genres: genero } });
        
        while (filmes.length < limite) {
            const novoFilme = await prisma.movie.create({
                data: { title: `Filme Autogerado ${genero} ${filmes.length + 1}`, genres: genero, isPopular: true }
            });
            filmes.push(novoFilme);
        }
        
        for (let i = 0; i < limite; i++) {
            await prisma.history.create({
                data: { userId, movieId: filmes[i].id, watchedAt: new Date() }
            });
        }
    },

    // Adiciona um filme específico diretamente ao histórico do usuário
    async adicionarAoHistorico(userId: string, filmeId: string) {
        await prisma.history.create({
            data: { userId, movieId: filmeId, watchedAt: new Date() }
        });
    },

    // Busca o histórico completo de um usuário
    async buscarHistoricoCompleto(userId: string) {
        return await prisma.history.findMany({
            where: { userId },
            include: { movie: true }
        });
    },

    // Remove um filme específico do histórico do usuário
    async removerFilmeDoHistorico(userId: string, nomeFilme: string) {
        const filme = await prisma.movie.findFirst({ where: { title: nomeFilme } });
        if (filme) {
            await prisma.history.deleteMany({ where: { userId, movieId: filme.id } });
        }
    },

    //Busca o ID do último filme assistido pelo usuário
    async obterUltimoMovieIdDoHistorico(userId: string): Promise<string | null> {
        const historico = await prisma.history.findFirst({
            where: { userId },
            orderBy: { watchedAt: 'desc' } // Pega o inserido recentemente
        });
        return historico ? historico.movieId : null;
    }
};