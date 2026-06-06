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
        let generoDefinido = "Geral";
        let filmeIrmaoTitulo = "Filme Equivalente de Teste";

        // Mapeamento idêntico aos cenários do Cucumber (.feature)
        if (nomeFilme === "Vingadores") { generoDefinido = "Ação"; filmeIrmaoTitulo = "Liga da Justiça"; }
        if (nomeFilme === "Círculo de Fogo") { generoDefinido = "Ação"; filmeIrmaoTitulo = "Matrix"; }
        if (nomeFilme === "Cabras da peste") { generoDefinido = "Comédia"; filmeIrmaoTitulo = "Superbad"; }
        if (nomeFilme === "Invocação do Mal") { generoDefinido = "Terror"; filmeIrmaoTitulo = "O Exorcista"; }

        let filme = await prisma.movie.findFirst({ 
            where: { title: nomeFilme, isDeleted: { not: true } } 
        });

        if (!filme) {
            filme = await prisma.movie.create({ 
                data: { title: nomeFilme, genres: generoDefinido, isPopular: false, isDeleted: false } 
            });
        }

        const irmaoExiste = await prisma.movie.findFirst({
            where: { title: filmeIrmaoTitulo, isDeleted: { not: true } }
        });
        if (!irmaoExiste) {
            await prisma.movie.create({
                data: { title: filmeIrmaoTitulo, genres: generoDefinido, isPopular: true, isDeleted: false }
            });
        }

        return filme;
    },

    // Cria filmes e insere no histórico para simular visualizações por gênero
    async garantirEAssistirFilmes(userId: string, qtd: string, genero: string) {
        const limite = parseInt(qtd);
    let filmes = await prisma.movie.findMany({ 
        where: { genres: genero, isDeleted: { not: true } } 
    });
    
    // Cria os filmes necessários para assistir
    while (filmes.length < limite) {
        const novoFilme = await prisma.movie.create({
            data: { title: `Filme Autogerado ${genero} ${filmes.length + 1}`, genres: genero, isPopular: true, isDeleted: false }
        });
        filmes.push(novoFilme);
    }
    
    // Assiste apenas até o limite exigido pelo teste
    for (let i = 0; i < limite; i++) {
        await prisma.history.create({
            data: { 
                userId, 
                movieId: filmes[i].id, 
                watchedAt: new Date(),
                is_completed: true, // Garante que o service vai considerar o filme como assistido por completo
                is_hidden: false,    // Garante que o filme não está escondido
                last_position: 0 
            }
        });
    }

    // Cria um filme extra não assistido para que a query 'notIn' tenha o que recomendar!
    await prisma.movie.create({
        data: { title: `Filme Extra de Recomendação ${genero}`, genres: genero, isPopular: false, isDeleted: false }
    });
    },

    // Adiciona um filme específico diretamente ao histórico do usuário
    async adicionarAoHistorico(userId: string, filmeId: string) {
        await prisma.history.create({
            data: { userId, movieId: filmeId, watchedAt: new Date(),is_completed: true,is_hidden: false}
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
        const filme = await prisma.movie.findFirst({ 
            where: { 
                title: nomeFilme,
                isDeleted:{not:true} 
            } 
        });
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
    },

    async assistirMesmoFilmeRepetido(userId: string, titulo: string, genero: string, vezes: number) {
        let filme = await prisma.movie.findFirst({ 
            where: { 
                title: titulo, 
                isDeleted:{not:true}
            }
        });
        
        if (!filme) {
            filme = await prisma.movie.create({
                data: { 
                    title: titulo, 
                    genres: genero, 
                    isPopular: false,
                    isDeleted: false
                }
            });
        }

        // Insere o mesmo movieId várias vezes no histórico do usuário
        for (let i = 0; i < vezes; i++) {
            await prisma.history.create({
                data: { 
                    userId, 
                    movieId: filme.id, 
                    watchedAt: new Date(),
                    is_completed: true,
                    is_hidden: false,
                    last_position: 0 
                }
            });
        }
        
        return filme;
    },

    // Corrige registros antigos com NULL para false, garantindo compatibilidade no PostgreSQL
    async sincronizarFilmesAtivos() {
        await prisma.movie.updateMany({
            where: { isDeleted: null },
            data: { isDeleted: false }
        });
    },

    // Garante que exista ao menos um filme popular ativo no catálogo para os fallbacks de teste
    async garantirFilmePopularSemente() {
        const popularExiste = await prisma.movie.findFirst({
            where: { 
                isPopular: true, 
                isDeleted: { not: true } 
            }
        });
        
        if (!popularExiste) {
            await prisma.movie.create({
                data: { 
                    title: "Filme Popular Semente", 
                    genres: "Ação", 
                    isPopular: true, 
                    isDeleted: false 
                }
            });
        }
    }

};

