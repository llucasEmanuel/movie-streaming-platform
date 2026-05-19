import { Given, When, Then, Before } from "@cucumber/cucumber";
import request from "supertest";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import { app } from "../../index";
import { prisma } from "../../database/prisma";

// Variáveis globais do cenário para guardar o estado entre os passos
let tokenDeAcesso = "";
let respostaApi: request.Response;
let idFilmeParaEdicao = "";
let payloadServico: any = {};

// Limpa a tabela para que eu possa rodar os testes, sem que um interfira no outro.
Before(async function () {
  await prisma.movie.deleteMany();
});

// Geração do Token -> Importante para verificar o cargo
Given("eu acesso o sistema como {string}", async function (cargo: string) {
  const secret = process.env.JWT_SECRET || "sua-chave-secreta-do-projeto";

  // O payload recebe o cargo exato que veio do Gherkin ("administrador")
  const payload = {
    id: "user-teste-123",
    role: cargo,
  };

  tokenDeAcesso = jwt.sign(payload, secret, { expiresIn: "1h" });
});

// Ignora-se esse passo
Given("eu estou na página {string}", async function (pagina: string) {});

// Enviando POST
When(
  "eu adiciono o filme {string} com sinopse {string} e duração {string}",
  async function (titulo: string, sinopse: string, duracaoTexto: string) {
    // Extrai apenas os números da string "104 minutos"
    const duracaoNumerica = parseInt(duracaoTexto.replace(/\D/g, ""), 10);

    // Monta o objeto com os dados da feature + dados obrigatórios genéricos
    const payloadFilme = {
      title: titulo,
      synopsis: sinopse,
      duration: duracaoNumerica,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      url_poster: "https://archive.org/download/michael/poster.jpeg",
      genres: ["Comédia"],
      directors: ["Guel Arraes"],
      cast: ["Matheus Nachtergaele", "Selton Mello"],
    };

    // Dispara o post real
    respostaApi = await request(app)
      .post("/movies")
      .set("Authorization", `Bearer ${tokenDeAcesso}`) // Definindo quem possui autorização para acessar o recurso
      .send(payloadFilme);
  },
);

// Validando se o filme foi inserido no banco de dados
Then(
  "eu vejo o filme {string} no {string}",
  async function (titulo: string, local: string) {
    // Verifica se o controller devolveu status 201 -> Created
    expect(respostaApi.status).to.equal(201);

    // Verificnado no banco de dados
    const filmeNoBanco = await prisma.movie.findFirst({
      where: { title: titulo },
    });

    expect(filmeNoBanco).to.not.be.null;
    expect(filmeNoBanco?.title).to.equal(titulo); // Foi inserido corretamente?
  },
);

// Verificação se os dados estão como esperados
Then(
  "eu vejo que o filme {string} possui a sinopse {string} e possui duração de {string}",
  async function (titulo: string, sinopse: string, duracaoTexto: string) {
    const duracaoEsperada = parseInt(duracaoTexto.replace(/\D/g, ""), 10);

    expect(respostaApi.body.title).to.equal(titulo);
    expect(respostaApi.body.synopsis).to.equal(sinopse);
    expect(respostaApi.body.duration).to.equal(duracaoEsperada);
  },
);

// Cadastro de filme com erro - Título vazio
When(
  "eu tento adicionar um filme deixando o título {string} e com sinopse {string}",
  async function (titulo: string, sinopse: string) {
    const payloadFilmeInvalido = {
      title: titulo, // Será ""
      synopsis: sinopse,
      duration: 120,
      url_movie: "https://archive.org/details/exemplo-filme-teste",
      url_poster: "https://archive.org/details/exemplo-poster-teste",
      genres: ["Drama"],
      directors: ["Diretor Teste"],
      cast: ["Ator Teste"],
    };

    respostaApi = await request(app)
      .post("/movies")
      .set("Authorization", `Bearer ${tokenDeAcesso}`)
      .send(payloadFilmeInvalido);
  },
);

Then(
  "eu vejo a mensagem de erro {string}",
  async function (mensagemErroEsperada: string) {
    // Verificação de duplicidade, acesso negado, sem token e payload
    expect([400, 401, 403, 409]).to.include(respostaApi.status);

    // Valida se a mensagem exata descrita no Gherkin voltou no corpo da resposta
    expect(respostaApi.body.message).to.equal(mensagemErroEsperada);
  },
);

// Ignora-se esse passo
Then("eu continuo na página {string}", async function (pagina: string) {});

// Preparando o banco de dados
Given(
  "que o sistema possui o filme {string} com sinopse {string}",
  async function (titulo: string, sinopse: string) {
    // Inserimos o filme para garantir que o estado inicial do teste exista
    const filmeCriado = await prisma.movie.create({
      data: {
        title: titulo,
        synopsis: sinopse,
        duration: 120, // Dummy
        url_movie: "https://archive.org/details/filme-edicao-teste", // Dummy
        url_poster: "https://archive.org/details/poster-edicao-teste", // Dummy
        genres: ["Drama"], // Dummy
        directors: ["Diretor Teste"], // Dummy
        cast: ["Ator Teste"], // Dummy
      },
    });

    // guardando o ID pois logo será útil
    idFilmeParaEdicao = filmeCriado.id;
  },
);

// Ignora-se esse passo
Given(
  "eu estou na página de {string} do filme {string}",
  async function (acaoVisual: string, titulo: string) {},
);

// patch
When("eu altero a sinopse para {string}", async function (novaSinopse: string) {
  // Apenas a sinopse atualizada
  const payloadAtualizacao = {
    synopsis: novaSinopse,
  };

  // Enviando a requisição patch
  respostaApi = await request(app)
    .patch(`/movies/${idFilmeParaEdicao}`)
    .set("Authorization", `Bearer ${tokenDeAcesso}`)
    .send(payloadAtualizacao);
});

// Validação da alteração
Then(
  "eu vejo a sinopse {string} nos {string} do filme {string}",
  async function (
    sinopseEsperada: string,
    localVisual: string,
    titulo: string,
  ) {
    // Verifica se a API respondeu com 200 - OK
    expect(respostaApi.status).to.equal(200);

    // Verifica se a resposta da API traz a sinopse atualizada
    expect(respostaApi.body.synopsis).to.equal(sinopseEsperada);
    expect(respostaApi.body.title).to.equal(titulo);

    // Vai no banco de dados garantir que o novo estado foi salvo (Postcondition)
    const filmeAtualizadoNoBanco = await prisma.movie.findUnique({
      where: { id: idFilmeParaEdicao },
    });

    expect(filmeAtualizadoNoBanco?.synopsis).to.equal(sinopseEsperada);
  },
);

// Inserção de +1 filme no banco
Given(
  "que o sistema possui os filmes {string} e {string} no catálogo",
  async function (filme1: string, filme2: string) {
    // Primeiro Filme
    await prisma.movie.create({
      data: {
        title: filme1, // "Shrek"
        synopsis: "Um ogro e um burro falante",
        duration: 90,
        url_movie: "https://archive.org/details/shrek-test",
        url_poster: "https://archive.org/details/shrek-poster",
        genres: ["Animação", "Comédia"],
        directors: ["Andrew Adamson"],
        cast: ["Mike Myers", "Eddie Murphy"],
      },
    });

    // segundo filme
    await prisma.movie.create({
      data: {
        title: filme2, // "Toy Story"
        synopsis: "Brinquedos ganham vida",
        duration: 81,
        url_movie: "https://archive.org/details/toystory-test",
        url_poster: "https://archive.org/details/toystory-poster",
        genres: ["Animação", "Aventura"],
        directors: ["John Lasseter"],
        cast: ["Tom Hanks", "Tim Allen"],
      },
    });
  },
);

// Delete
When("eu removo o filme {string}", async function (filmeParaRemover: string) {
  // Buscando o ID real do filme
  const filmeNoBanco = await prisma.movie.findFirst({
    where: { title: filmeParaRemover },
  });

  if (!filmeNoBanco)
    // Caso não exista, lançamos erro
    throw new Error(
      `Filme ${filmeParaRemover} não encontrado para exclusão no setup.`,
    );

  // Enviando o delete
  respostaApi = await request(app)
    .delete(`/movies/${filmeNoBanco.id}`)
    .set("Authorization", `Bearer ${tokenDeAcesso}`);
});

// Verificando se ocorreu a exclusão
Then(
  "eu não vejo o filme {string} no {string}",
  async function (filmeRemovido: string, localVisual: string) {
    // Confirma que a API respondeu com sucesso - 200 ou 204 - No content
    expect([200, 204]).to.include(respostaApi.status);

    // Vai ao banco confirmar a exclusão
    const filmeNoBanco = await prisma.movie.findFirst({
      where: { title: filmeRemovido },
    });

    // O filme ainda deve existir fisicamente no banco, mas a flag isDeleted === true
    expect(filmeNoBanco).to.not.be.null;
    expect(filmeNoBanco?.isDeleted).to.be.true;
  },
);

// Verificando se o outro filme ainda está com isDeleted === false
Then(
  "eu continuo vendo o filme {string} no {string}",
  async function (filmeIntacto: string, localVisual: string) {
    // Vai ao banco garantir que a exclusão não afetou outros filmes
    const filmeNoBanco = await prisma.movie.findFirst({
      where: { title: filmeIntacto },
    });

    // O filme deve existir e a flag isDeleted === false
    expect(filmeNoBanco).to.not.be.null;
    expect(filmeNoBanco?.isDeleted).to.be.false;
  },
);

// Inserindo filme com qualquer título
Given("que o sistema possui o filme {string}", async function (titulo: string) {
  // Gerando urls
  const urlSufixo = titulo.replace(/\s+/g, "").toLowerCase();

  const filmeCriado = await prisma.movie.create({
    data: {
      title: titulo,
      synopsis: "Sinopse genérica gerada para o teste",
      duration: 120,
      url_movie: `https://archive.org/details/${urlSufixo}-teste`,
      url_poster: `https://archive.org/details/${urlSufixo}-poster`,
      genres: ["Genérico"],
      directors: ["Diretor Teste"],
      cast: ["Ator Teste"],
    },
  });

  // Guardando o ID caso o cenário precise dele para uma edição ou exclusão futura
  idFilmeParaEdicao = filmeCriado.id;
});

// Tentativa de cadastro de um filme com o mesmo título
When(
  "eu tento adicionar o filme {string} com sinopse {string} e duração {string}",
  async function (titulo: string, sinopse: string, duracaoTexto: string) {
    const duracaoNumerica = parseInt(duracaoTexto.replace(/\D/g, ""), 10);

    // Monta o payload idêntico ao de um cadastro de sucesso
    const payloadFilmeDuplicado = {
      title: titulo,
      synopsis: sinopse,
      duration: duracaoNumerica,
      url_movie: "https://archive.org/details/lotr-teste-novo",
      url_poster: "https://archive.org/details/lotr-poster-novo",
      genres: ["Fantasia"],
      directors: ["Peter Jackson"],
      cast: ["Elijah Wood"],
    };

    // Dispara o post
    respostaApi = await request(app)
      .post("/movies")
      .set("Authorization", `Bearer ${tokenDeAcesso}`)
      .send(payloadFilmeDuplicado);
  },
);

// Verificando se uma cópia não foi criada
Then(
  "o sistema não cria uma cópia duplicada do filme {string}",
  async function (titulo: string) {
    // Fazemos uma contagem no banco de dados buscando por esse título
    const quantidadeNoBanco = await prisma.movie.count({
      where: { title: titulo },
    });

    // Verificando se de fato só existe um filme com aquele título
    expect(quantidadeNoBanco).to.equal(1);
  },
);

// Edição do título de um filme para ""
When("eu altero o título para {string}", async function (novoTitulo: string) {
  // Montamos o payload enviando o título vazio
  const payloadAtualizacao = {
    title: novoTitulo,
  };

  // Disparamos o patch para a rota dinâmica
  respostaApi = await request(app)
    .patch(`/movies/${idFilmeParaEdicao}`)
    .set("Authorization", `Bearer ${tokenDeAcesso}`)
    .send(payloadAtualizacao);
});

// Garantindo que o banco rejeitou
Then(
  "eu vejo que o título do filme continua sendo {string} no {string}",
  async function (tituloEsperado: string, localVisual: string) {
    // Vamos até o banco de dados resgatar o registro atual para confirmar que a edição falhou
    const filmeNoBanco = await prisma.movie.findUnique({
      where: { id: idFilmeParaEdicao },
    });

    // Confirma que o filme existe e que o título permanece intacto
    expect(filmeNoBanco).to.not.be.null;
    expect(filmeNoBanco?.title).to.equal(tituloEsperado);
  },
);

// Usuário comum tentando acessar
When("eu tento acessar a página {string}", async function (pagina: string) {
  // disparamos uma requisição POST
  respostaApi = await request(app)
    .post("/movies")
    .set("Authorization", `Bearer ${tokenDeAcesso}`)
    .send({}); // Não importa, pois o middleware deve barrar
});

Given(
  "eu preparo um payload de filme tentando cadastrar novamente o título {string}",
  async function (titulo: string) {
    payloadServico = {
      title: titulo,
      synopsis: "Uma nova sinopse tentando sobrescrever",
      duration: 150,
      url_movie: "https://archive.org/details/filme-novo",
      url_poster: "https://archive.org/details/poster-novo",
      genres: ["Aventura"],
      directors: ["Christopher Nolan"],
      cast: ["Matthew McConaughey"],
    };
  },
);

Given(
  "eu possuo um token de autenticação válido com cargo de {string}",
  async function (cargo: string) {
    const secret = process.env.JWT_SECRET || "sua-chave-secreta-do-projeto";
    const payload = {
      id: "admin-id-456",
      role: cargo,
    };
    tokenDeAcesso = jwt.sign(payload, secret, { expiresIn: "1h" });
  },
);

When(
  "eu envio uma requisição {string} para a rota {string} com esse payload",
  async function (metodoHttp: string, rota: string) {
    if (metodoHttp.toUpperCase() === "POST") {
      respostaApi = await request(app)
        .post(rota)
        .set("Authorization", `Bearer ${tokenDeAcesso}`)
        .send(payloadServico);
    }
  },
);

Then(
  "o status da resposta HTTP deve ser {string}",
  async function (statusCodeTexto: string) {
    const statusCodeEsperado = parseInt(statusCodeTexto, 10);
    expect(respostaApi.status).to.equal(statusCodeEsperado);
  },
);

Then(
  "o JSON da resposta deve conter a mensagem de erro {string}",
  async function (mensagemErroEsperada: string) {
    expect(respostaApi.body.message).to.equal(mensagemErroEsperada);
  },
);

Given(
  "eu preparo um payload válido de filme com o título {string}, sinopse {string} e duração {string}",
  async function (titulo: string, sinopse: string, duracaoTexto: string) {
    const duracaoNumerica = parseInt(duracaoTexto.replace(/\D/g, ""), 10);

    payloadServico = {
      title: titulo,
      synopsis: sinopse,
      duration: duracaoNumerica,
      url_movie: "https://archive.org/details/auto-da-compadecida-teste",
      url_poster: "https://archive.org/details/auto-da-compadecida-poster",
      genres: ["Comédia", "Aventura"],
      directors: ["Guel Arraes"],
      cast: ["Matheus Nachtergaele", "Selton Mello"],
    };
  },
);

Then(
  "o JSON da resposta deve conter o título {string}, a sinopse {string} e a duração de {string}",
  async function (
    tituloEsperado: string,
    sinopseEsperada: string,
    duracaoTexto: string,
  ) {
    const duracaoEsperada = parseInt(duracaoTexto.replace(/\D/g, ""), 10);

    expect(respostaApi.body.title).to.equal(tituloEsperado);
    expect(respostaApi.body.synopsis).to.equal(sinopseEsperada);
    expect(respostaApi.body.duration).to.equal(duracaoEsperada);
  },
);

When(
  "eu envio uma requisição {string} para a rota {string} com um payload vazio",
  async function (metodoHttp: string, rota: string) {
    if (metodoHttp.toUpperCase() === "POST") {
      respostaApi = await request(app)
        .post(rota)
        .set("Authorization", `Bearer ${tokenDeAcesso}`)
        .send({});
    }
  },
);
