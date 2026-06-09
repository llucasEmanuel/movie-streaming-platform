import { Given, When, Then, Before } from '@cucumber/cucumber';
import request from 'supertest';
import assert from 'assert';
import app from '../../src/index'; 
import { PrismaClient } from "../../src/generated/prisma";

const prisma = new PrismaClient();

// Variáveis de contexto para compartilhar estado entre os passos
let response: request.Response;
let currentUser: string;
let currentPayload: { id_user?: string; id_movie?: string; last_position?: number; watched_at?: string } = {};

// Dados padrão para preencher os campos obrigatórios do Prisma Schema ao criar filmes mockados
const defaultMovieData = {
    synopsis: 'Sinopse gerada para teste',
    file_name: 'video_teste.mp4',
    genres: 'Ação, Drama',
    director: 'Diretor Teste',
    cast: 'Ator 1, Ator 2',
    img_url: 'http://url-da-imagem.com/img.png'
};

// Limpa o banco de dados antes de cada cenário para garantir isolamento
Before(async () => {
    await prisma.history.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany();
});

// --- Cenário 1: Salvar progresso de um filme assistido ---

Given('que o usuário {string} está logado', async (userId: string) => {
    currentUser = userId;
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, name: 'User Test', email: 'test@test.com' }
    });
});

Given('o filme de id {string} está disponível no catálogo', async (movieId: string) => {
    await prisma.movie.upsert({
        where: { id: movieId },
        update: {},
        create: { 
            id: movieId, 
            title: 'Filme Teste', 
            duration: '120', 
            ...defaultMovieData 
        }
    });
});

When('uma requisição {string} for enviada para {string} com o filme de id {string} e tempo assistido {int} minutos', async (method: string, endpoint: string, movieId: string, watchedTime: number) => {
    currentPayload = {
        id_user: currentUser,
        id_movie: movieId,
        last_position: watchedTime
    };

    if (method.toUpperCase() === 'POST') {
        response = await request(app).post(endpoint).send(currentPayload);
    }
});

Then('o status da resposta deve ser {string}', (statusCode: string) => {
    assert.strictEqual(response.status, parseInt(statusCode, 10));
});

Then('o registro de progresso para o filme de id {string} deve ser atualizado para {int} minutos', async (movieId: string, watchedTime: number) => {
    const historyRecord = await prisma.history.findFirst({
        where: { userId: currentUser, movieId: movieId }
    });

    assert.ok(historyRecord, 'Registro de histórico não encontrado');
    assert.strictEqual(historyRecord.last_position, watchedTime);
});

// --- Cenário 2: Obter o histórico do usuário ---

Given('que o usuário {string} está cadastrado no sistema', async (userId: string) => {
    currentUser = userId;
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, name: 'User Test', email: 'test@test.com' }
    });
});

Given('o usuário assistiu ao filme de id {string} no dia {string}', async (movieId: string, dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const watchedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    await prisma.movie.upsert({
        where: { id: movieId },
        update: {},
        create: { 
            id: movieId, 
            title: 'Filme Histórico', 
            duration: '120', 
            ...defaultMovieData 
        }
    });

    await prisma.history.create({
        data: {
            userId: currentUser,
            movieId: movieId,
            watchedAt: watchedDate,
            last_position: 60,
            is_completed: false,
            is_hidden: false
        }
    });
});

Given('o usuário não assistiu nenhum outro filme', async () => {
    const count = await prisma.history.count({ where: { userId: currentUser } });
    assert.strictEqual(count, 1);
});

When('uma requisição {string} for enviada para o endpoint de histórico do usuário {string}', async (method: string, userId: string) => {
    if (method.toUpperCase() === 'GET') {
        response = await request(app).get(`/history/${userId}`);
    }
});

Then('o registro do filme de id {string} deve constar na lista', (movieId: string) => {
    const data = response.body.data;
    const movieExists = data.some((record: any) => record.movieId === movieId);
    assert.ok(movieExists, `Filme ${movieId} não consta na lista retornada`);
});

Then('nenhum outro filme deve constar na lista', () => {
    const data = response.body.data;
    assert.strictEqual(data.length, 1);
});

// --- Cenário 3: Registrar novo filme no histórico ---

Given('que o usuário está logado', async () => {
    currentUser = 'user-default';
    await prisma.user.upsert({
        where: { id: currentUser },
        update: {},
        create: { id: currentUser, name: 'Default', email: 'default@test.com' }
    });
});

Given('não possui nenhum registro de histórico para o filme {string} no dia {string} para o usuário', async (movieTitle: string, dateStr: string) => {
    const movie = await prisma.movie.upsert({
        where: { id: 'filme-1' },
        update: { title: movieTitle },
        create: { 
            id: 'filme-1', 
            title: movieTitle, 
            duration: '150', 
            ...defaultMovieData 
        }
    });

    const count = await prisma.history.count({
        where: { userId: currentUser, movieId: movie.id }
    });
    assert.strictEqual(count, 0);
});

When('é enviada uma requisição para salvar o progresso do filme {string} com tempo assistido de {string} minutos no dia {string}', async (movieTitle: string, time: string, dateStr: string) => {
    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    
    response = await request(app).post('/history/progress').send({
        id_user: currentUser,
        id_movie: movie!.id,
        last_position: parseInt(time, 10),
        watched_at: new Date(dateStr.split('/').reverse().join('-') + 'T00:00:00.000Z').toISOString()
    });
});

Then('deve existir um novo registro para o filme {string} no dia {string}', async (movieTitle: string, dateStr: string) => {
    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    const records = await prisma.history.findMany({
        where: { userId: currentUser, movieId: movie!.id }
    });
    assert.strictEqual(records.length, 1);
});

Then('ele deve ter o tempo assistido de {string} minutos', async (time: string) => {
    const lastRecord = await prisma.history.findFirst({
        where: { userId: currentUser },
        orderBy: { watchedAt: 'desc' }
    });
    assert.strictEqual(lastRecord!.last_position, parseInt(time, 10));
});

// --- Cenários 4 e 5: Reassistir e Múltiplas Visualizações ---

Given('possui um registro de histórico para o filme {string} no dia {string} com tempo assistido de {string} minutos', async (movieTitle: string, dateStr: string, time: string) => {
    const [day, month, year] = dateStr.split('/');
    const watchedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    let movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    if (!movie) {
        movie = await prisma.movie.create({
            data: { 
                id: `movie-${Date.now()}`, 
                title: movieTitle, 
                duration: '120', 
                ...defaultMovieData 
            }
        });
    }

    await prisma.history.create({
        data: {
            userId: currentUser,
            movieId: movie.id,
            watchedAt: watchedDate,
            last_position: parseInt(time, 10),
        }
    });
});

Then('deve existir apenas um registro para o filme {string} no dia {string}', async (movieTitle: string, dateStr: string) => {
    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    const records = await prisma.history.findMany({
        where: { userId: currentUser, movieId: movie!.id }
    });
    assert.strictEqual(records.length, 1);
});

Then('deve ter o tempo assistido atualizado de {string} minutos', async (time: string) => {
    const lastRecord = await prisma.history.findFirst({
        where: { userId: currentUser },
        orderBy: { watchedAt: 'desc' }
    });
    assert.strictEqual(lastRecord!.last_position, parseInt(time, 10));
});

When('é enviada uma requisição para salvar o progresso do filme {string} com tempo assistido de {string} minutos no dia {string} do usuário', async (movieTitle: string, time: string, dateStr: string) => {
     const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
     response = await request(app).post('/history/progress').send({
         id_user: currentUser,
         id_movie: movie!.id,
         last_position: parseInt(time, 10),
         watched_at: new Date(dateStr.split('/').reverse().join('-') + 'T00:00:00.000Z').toISOString()
     });
});

Then('deve existir um novo registro para o filme {string} no dia {string} com tempo assistido de {string} minutos', async (movieTitle: string, dateStr: string, time: string) => {
    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    const records = await prisma.history.findMany({
        where: { userId: currentUser, movieId: movie!.id }
    });
    
    assert.strictEqual(records.length, 2);
    
    const newestRecord = records.sort((a: { watchedAt: Date }, b: { watchedAt: Date }) => b.watchedAt.getTime() - a.watchedAt.getTime())[0];
    assert.strictEqual(newestRecord.last_position, parseInt(time, 10));
});

Then('o registro do filme {string} no dia {string} deve permanecer com o tempo assistido de {string} minutos', async (movieTitle: string, dateStr: string, time: string) => {
    const [day, month, year] = dateStr.split('/');
    const oldDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    const oldRecord = await prisma.history.findUnique({
        where: {
            userId_movieId_watchedAt: {
                userId: currentUser,
                movieId: movie!.id,
                watchedAt: oldDate
            }
        }
    });

    assert.strictEqual(oldRecord!.last_position, parseInt(time, 10));
});

// --- Cenário 6 e 7: Ocultar Histórico ---

Given('possui um registro de histórico para o filme {string} no dia {string}', async (movieTitle: string, dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const watchedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    let movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    if (!movie) {
        movie = await prisma.movie.create({
            data: { 
                id: `movie-${movieTitle.replace(/\s/g, '')}`, 
                title: movieTitle, 
                duration: '120', 
                ...defaultMovieData 
            }
        });
    }

    await prisma.history.create({
        data: {
            userId: currentUser,
            movieId: movie.id,
            watchedAt: watchedDate,
            last_position: 10,
            is_hidden: false
        }
    });
});

When('é enviada uma requisição para esconder o registro do filme {string} do dia {string} do usuário', async (movieTitle: string, dateStr: string) => {
    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    const [day, month, year] = dateStr.split('/');
    const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;

    response = await request(app).patch('/history/hide-movie').send({
        id_user: currentUser,
        id_movie: movie!.id,
        watched_at: formattedDate
    });
});

Then('o registro do filme {string} no dia {string} para o usuário passa a constar internamente como oculto no sistema', async (movieTitle: string, dateStr: string) => {
    const movie = await prisma.movie.findFirst({ where: { title: movieTitle } });
    const [day, month, year] = dateStr.split('/');
    const watchedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    const record = await prisma.history.findUnique({
        where: {
            userId_movieId_watchedAt: {
                userId: currentUser,
                movieId: movie!.id,
                watchedAt: watchedDate
            }
        }
    });

    assert.strictEqual(record!.is_hidden, true);
});

When('é enviada uma requisição para ocultar todo o histórico do usuário', async () => {
    response = await request(app).patch('/history/hide-all').send({
        id_user: currentUser
    });
});

Then('os registros de {string} e {string} para o usuário passam a constar internamente como ocultos no sistema', async (movie1: string, movie2: string) => {
    const hiddenRecords = await prisma.history.findMany({
        where: { userId: currentUser, is_hidden: true },
        include: { movie: true }
    });

    assert.strictEqual(hiddenRecords.length, 2);
    const titles = hiddenRecords.map((r: { movie: { title: string } }) => r.movie.title);
    assert.ok(titles.includes(movie1));
    assert.ok(titles.includes(movie2));
});

// --- Cenário 8: Ocultar histórico vazio ---

Given('o histórico do usuário está completamente vazio no sistema', async () => {
    await prisma.history.deleteMany({ where: { userId: currentUser } });
});

When('eu solicito esconder todo o histórico do usuário', async () => {
    response = await request(app).patch('/history/hide-all').send({
        id_user: currentUser
    });
});

Then('o servidor retorna uma resposta de erro notificando que a operação é inválida', () => {
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Seu histórico já está vazio.');
});

Then('o histórico do usuário permanece completamente vazio no sistema', async () => {
    const count = await prisma.history.count({ where: { userId: currentUser } });
    assert.strictEqual(count, 0);
});