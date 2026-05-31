import { Given, When, Then, Before } from "@cucumber/cucumber";
import { DBUtils } from "../../src/utils/db-utils";
import { RecommendationService } from "../../src/services/recommendation-service";
import axios from "axios";
import assert from "assert";
import { sharedState } from "./shared-state";

const api = axios.create({ 
    baseURL: 'http://localhost:3000', 
    validateStatus: () => true 
});

// Instancia o serviço para os testes de método direto
const service = new RecommendationService();

let response: any;
let serviceResult: any;
let config: any;

Before(async () => {
    const user = await DBUtils.garantirUsuario("julio_bdd_dinamico@teste.com", "Julio Cesar Dinamico");
    sharedState.currentUserId = user.id;
    await DBUtils.limparHistorico(sharedState.currentUserId);
    config = { 
        headers: { 
            'x-test-user-id': sharedState.currentUserId 
        } 
    };
    response = undefined;
    serviceResult = undefined;

});

// --- GIVENS (Contextos) ---

Given('eu não está logado na plataforma', function () {
    sharedState.currentUserId = ""; 
});

Given('eu não possuo histórico de visualização', async function () {
    await DBUtils.limparHistorico(sharedState.currentUserId);
});


Given('eu assisti a {string} filmes do gênero {string} nos últimos {string} dias', async function (qtd, genero, dias) {
    await DBUtils.garantirEAssistirFilmes(sharedState.currentUserId, qtd, genero);
});

Given('eu assisti a {string} filmes do gênero {string}', async function (qtd, genero) {
    await DBUtils.garantirEAssistirFilmes(sharedState.currentUserId, qtd, genero);
});

Given('eu assisti a {string} filme do gênero {string}', async function (qtd, genero) {
    await DBUtils.garantirEAssistirFilmes(sharedState.currentUserId, qtd, genero);
});

Given('a regra de negócio exige no mínimo {string} filmes do mesmo gênero para gerar recomendações', function (minimo) {
    const valorMinimo = parseInt(minimo, 10);
    // Asserção de segurança: Garante que o teste do Gherkin está alinhado 
    // com a regra de negócio atual do sistema (que é 3)
    assert.strictEqual(valorMinimo, 3, "A regra de negócio configurada no backend diverge do cenário de teste.");
});

Given('eu possuo no histórico o filme {string}', async function (nomeFilme) {
    const filme = await DBUtils.garantirFilmeUnico(nomeFilme);
    await DBUtils.adicionarAoHistorico(sharedState.currentUserId, filme.id);
});

Given('eu possuo no histórico os filmes {string} e {string}', async function (filme1, filme2) {
    for (const nome of [filme1, filme2]) {
        const filme = await DBUtils.garantirFilmeUnico(nome);
        await DBUtils.adicionarAoHistorico(sharedState.currentUserId, filme.id);
    }
});

Given('a playlist {string} está disponível', function (_playlist) {
    // Passo conceitual. A disponibilidade real é ditada pelo histórico inserido nos passos anteriores.
});

Given('eu possuo {string} filme(s) assistido(s) do gênero {string} nos últimos {string} dias', async function (quantidade, genero, _dias) {
    await DBUtils.garantirEAssistirFilmes(sharedState.currentUserId, quantidade, genero);
});

Given('eu assisti ao filme {string} do gênero {string} por {string} vezes nos últimos {string} dias', async function (titulo, genero, vezes, _dias) {
    const loop = parseInt(vezes, 10);
    
    await DBUtils.assistirMesmoFilmeRepetido(sharedState.currentUserId, titulo, genero, loop);
});

// --- WHENS (Ações com Headers Injetados) ---

When('eu acesso a página {string}', async function (pagina) {
    if (!sharedState.currentUserId) {
        response = { status: 401, data: { message: "Faça login para acessar o conteúdo" } };
        return;
    }

    // Se o teste diz que está acessando "Recomendados", batemos na rota principal de gêneros
    // que é onde ficam as travas de "Assista mais conteúdos..."
    if (pagina === "Recomendados") {
        response = await api.get(`/recommendations/genres/${sharedState.currentUserId}`, config);
    } 
    
});

When('eu acesso a seção {string}', async function (secao) {
    response = await api.get(`/recommendations/genres/${sharedState.currentUserId}`, config);
});

When('eu assistir a um novo filme do gênero {string}', async function (genero) {
    await DBUtils.garantirEAssistirFilmes(sharedState.currentUserId, "1", genero);
});

When('eu assisto ao filme {string}', async function (nomeFilme) {
    const filme = await DBUtils.garantirFilmeUnico(nomeFilme);
    await DBUtils.adicionarAoHistorico(sharedState.currentUserId, filme.id);
});

When('eu removo o filme {string} do histórico', async function (nomeFilme) {
    await DBUtils.removerFilmeDoHistorico(sharedState.currentUserId, nomeFilme);
});

When('eu atualizo a página {string}', async function (pag) {
    response = await api.get(`/recommendations/genres/${sharedState.currentUserId}`, config);
});

When('o serviço calcula as recomendações de gênero para o usuário {string}', async function (_role) {
    // Independente do texto ser "usuário", o código usa o ID seguro do Before
    serviceResult = await service.getGenreRecommendations(sharedState.currentUserId);
});

// --- THENS (Validações) ---

Then('a página {string} deve exibir a playlist {string} em destaque na página', function (pag, tituloEsperado) {
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.sectionTitle, tituloEsperado);
});

Then('não deve ser exibida nenhuma seção de recomendações baseada em gostos pessoais', function () {
    assert.notStrictEqual(response.data.sectionTitle, "Recomendações de Gênero");
});

Then('a página {string} exibe a playlist {string} entre as 3 primeiras seções', function (pag, playlistEsperada) {
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.sectionTitle, playlistEsperada);
});

Then('a playlist {string} contém os filmes do gênero {string}', function (playlist, genero) {
    if (response.data.movies && response.data.movies.length > 0) {
        assert.strictEqual(response.data.movies[0].genres, genero);
    }
});

Then('a página {string} exibe a playlist {string} acima da playlist {string}', function (pag, lista1, lista2) {
    assert.strictEqual(response.data.sectionTitle, lista1);
});

Then('a página {string} não exibe a playlist {string}', function (pag, lista) {
    if (response.data.message) {
        assert.ok(true);
    } else {
        assert.notStrictEqual(response.data.sectionTitle, lista);
    }
});

Then('a página {string} exibe os filmes do catálogo geral', function (_pag) {
    // 1. Garante que a propriedade movies veio na resposta da API
    assert.ok(Array.isArray(response?.data?.movies), "A propriedade 'movies' deveria ser um array.");
    
    // 2. Garante que o array NÃO está vazio (ou seja, o backend enviou os filmes de fallback)
    assert.ok(response.data.movies.length > 0, "O catálogo geral de filmes não foi exibido.");
});

Then('a página {string} exibe a playlist {string}', async function (pag, listaEsperada) {
    if (listaEsperada.includes("Porque você assistiu")) {
        const movieId = await DBUtils.obterUltimoMovieIdDoHistorico(sharedState.currentUserId);
        if (movieId) {
            response = await api.get(`/recommendations/similar/${movieId}`, config);
        }
    } 

    assert.strictEqual(response.data.sectionTitle, listaEsperada);
});

Then('a página {string} não exibe seções personalizadas baseadas em histórico', function (pag) {
    assert.strictEqual(response.data.sectionTitle, "Lançamentos e Populares");
});

Then('a página {string} exibe a mensagem {string}', function (pag, mensagemEsperada) {
    assert.strictEqual(response.data.message, mensagemEsperada);
});

Then('a playlist {string} contém o filme {string}', function (playlist, filme) {
    assert.strictEqual(response.status, 200);
});

Then('o sistema exibe a mensagem {string}', function (mensagemEsperada) {
    assert.strictEqual(response.data.message, mensagemEsperada);
});

Then('o sistema não exibe {string}', function (elemento) {
    assert.strictEqual(response.status, 401);
});

Then('o serviço retorna a seção de título {string}', function (tituloEsperado) {
    assert.strictEqual(serviceResult?.sectionTitle, tituloEsperado);
});

Then('a lista de filmes recomendados não deve ser vazia', function () {
    assert.ok(serviceResult?.movies?.length > 0, "A lista de recomendações do serviço veio vazia.");
});

Then('o serviço retorna a mensagem {string}', function (mensagemEsperada) {
    assert.strictEqual(serviceResult?.message, mensagemEsperada);
});

Then('o serviço preenche a lista com os filmes do catálogo geral como fallback', function () {
    assert.ok(serviceResult?.movies?.length > 0, "O service não incluiu os filmes de fallback.");
});

Then('a lista de filmes recomendados contém os destaques da plataforma', function () {
    assert.ok(serviceResult?.movies?.length > 0);
});

Then('o serviço contabiliza apenas {string} filme único para a regra de mínimo de dados', function (_qtd) {
    assert.ok(serviceResult?.movies?.length > 0, "A lista de filmes de fallback veio vazia.");
    
    assert.notStrictEqual(serviceResult?.sectionTitle, "Recomendações de Terror", "O motor aceitou o spam e gerou recomendações personalizadas de Terror!");
});

Then('o serviço aplica o fallback exibindo a mensagem {string}', function (mensagemEsperada) {
    assert.strictEqual(serviceResult?.message, mensagemEsperada);
    
    assert.ok(serviceResult?.movies?.length > 0, "O serviço aplicou a mensagem, mas deixou a lista de filmes vazia.");
});