import {
  createMovieService,
  deleteMovieService,
  updateMoviesService,
} from "../../../services/movie-service";

import * as movieRepository from "../../../repositories/movie-repository";

jest.mock("../../../repositories/movie-repository");

describe("Teste unitário - Create Movie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Deve lançar um erro se tentar criar um filme sem título", async () => {
    const filmeInvalido = {
      title: "",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "O título é obrigatório",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme sem link", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "A URL do filme é necessária",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme sem sinopse", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "A sinopse do filme é obrigatória",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme sem duração", async () => {
    const filmeInvalido = {
      title: "Michael",
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    } as any;

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "A duração do filme é obrigatória",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme sem gêneros", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: [],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "Necessário preencher os gêneros",
    );
    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme sem poster", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "O poster do filme é obrigatório",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme sem HTTPS", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "http://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "A URL do filme deve utilizar uma conexão segura",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme com origem inválida", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "https://youtube.com/watch?v=video",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "Origem do vídeo não autorizada",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme com texto qualquer", async () => {
    const filmeInvalido = {
      title: "Michael",
      duration: 120,
      url_movie: "texto-aleatorio",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    await expect(createMovieService(filmeInvalido)).rejects.toThrow(
      "A URL fornecida possui formato inválido",
    );

    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar criar um filme que já existe na base de dados", async () => {
    // Dados do filme que você está tentando cadastrar
    const filmeDuplicado = {
      title: "Michael",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    // Simulamos que o banco de dados encontrou um filme com esses dados cadastrados
    (movieRepository.findMovieByTitleOrUrl as jest.Mock).mockResolvedValueOnce({
      id: "uuid-ja-existente",
      title: "Michael",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      isDeleted: false,
      url_poster: "link.com",
      createdAt: new Date(),
    });

    // O serviço deve interceptar a duplicidade e lançar o ConflictError
    await expect(createMovieService(filmeDuplicado)).rejects.toThrow(
      "Este filme já existe na base de dados",
    );

    // Garante que o fluxo foi interrompido antes de tentar salvar no banco
    expect(movieRepository.insertMovie).not.toHaveBeenCalled();
  });

  it("Deve criar um filme com sucesso quando os dados são válidos", async () => {
    const novoFilme = {
      title: "Michael",
      duration: 120,
      url_movie: "https://archive.org/download/michael/filme.mp4",
      genres: ["Drama"],
      synopsis: "Texto descritivo",
      url_poster: "link.com",
    };

    const filmeSalvoMock = {
      id: "uuid-123456789",
      createdAt: new Date(),
      isDeleted: false,
      ...novoFilme,
    };

    (movieRepository.findMovieByTitleOrUrl as jest.Mock).mockResolvedValueOnce(
      null,
    );

    (movieRepository.insertMovie as jest.Mock).mockResolvedValueOnce(
      filmeSalvoMock,
    );

    const resultado = await createMovieService(novoFilme);

    expect(movieRepository.insertMovie).toHaveBeenCalledTimes(1);
    expect(movieRepository.insertMovie).toHaveBeenCalledWith(novoFilme);
    expect(resultado.id).toBe("uuid-123456789");
  });
});

describe("Teste unitário - Delete Movie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Deve lançar um erro se o ID não for informado (vazio)", async () => {
    await expect(deleteMovieService("")).rejects.toThrow(
      "ID do filme deve ser informado",
    );
    expect(movieRepository.deleteMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se o ID for composto apenas por espaços em branco", async () => {
    await expect(deleteMovieService("   ")).rejects.toThrow(
      "ID do filme deve ser informado",
    );
    expect(movieRepository.deleteMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se o filme não for encontrado no banco de dados", async () => {
    //  repositório tentou deletar, mas não encontrou o filme
    (movieRepository.deleteMovie as jest.Mock).mockResolvedValueOnce(null);

    await expect(deleteMovieService("id-inexistente-123")).rejects.toThrow(
      "Impossível excluir! Não existe esse filme na base de dados",
    );

    // Garante que a função do repositório foi chamada com o ID correto
    expect(movieRepository.deleteMovie).toHaveBeenCalledTimes(1);
    expect(movieRepository.deleteMovie).toHaveBeenCalledWith(
      "id-inexistente-123",
    );
  });

  it("Deve excluir o filme com sucesso quando o ID for válido e existir no banco", async () => {
    // Simulando que o repositório encontrou e deletou o filme
    const filmeDeletadoMock = { id: "id-valido-123", isDeleted: true };
    (movieRepository.deleteMovie as jest.Mock).mockResolvedValueOnce(
      filmeDeletadoMock,
    );

    // Como a service de deleção retorna nada, não deve lançar erros
    await expect(deleteMovieService("id-valido-123")).resolves.not.toThrow();

    expect(movieRepository.deleteMovie).toHaveBeenCalledTimes(1);
    expect(movieRepository.deleteMovie).toHaveBeenCalledWith("id-valido-123");
  });
});

// Update

describe("Teste unitário - Update Movie", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Deve lançar um erro se o ID não for informado", async () => {
    await expect(
      updateMoviesService("", { title: "Novo Titulo" }),
    ).rejects.toThrow("ID do filme deve ser informado");

    expect(movieRepository.updateMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se tentar alterar o ID original via payload", async () => {
    await expect(
      updateMoviesService("id-correto", {
        id: "id-malicioso",
        title: "Novo Titulo",
      }),
    ).rejects.toThrow("Não é permitido alterar o ID de um filme existente");

    expect(movieRepository.updateMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se o título enviado for vazio ou apenas espaços", async () => {
    await expect(
      updateMoviesService("id-valido", { title: "   " }),
    ).rejects.toThrow(
      "O título do filme é obrigatório e não pode ficar em branco",
    );

    expect(movieRepository.updateMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro de conflito se já existir outro filme com o mesmo título", async () => {
    // Simulamos que a busca encontrou outro filme que já usa esse título
    (movieRepository.findMovieByTitleOrUrl as jest.Mock).mockResolvedValueOnce({
      id: "id-de-outro-filme",
      title: "O Senhor dos Anéis",
      url_movie: "https://archive.org/filme-diferente",
    });

    await expect(
      updateMoviesService("meu-id-atual", { title: "O Senhor dos Anéis" }),
    ).rejects.toThrow(
      "Não é possível fazer essa atualização. Já existe um filme com esse título",
    );

    expect(movieRepository.updateMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro de conflito se já existir outro filme com a mesma URL", async () => {
    // Simulamos que a busca encontrou outro filme que já usa essa URL
    (movieRepository.findMovieByTitleOrUrl as jest.Mock).mockResolvedValueOnce({
      id: "id-de-outro-filme",
      title: "Filme Qualquer",
      url_movie: "https://archive.org/url-duplicada",
    });

    await expect(
      updateMoviesService("meu-id-atual", {
        url_movie: "https://archive.org/url-duplicada",
      }),
    ).rejects.toThrow(
      "Não é possível fazer essa atualização. Já existe um filme com essa URL",
    );

    expect(movieRepository.updateMovie).not.toHaveBeenCalled();
  });

  it("Deve lançar um erro se o filme não for encontrado na base na hora de salvar", async () => {
    // Simulamos que não há conflito de nome/url
    (movieRepository.findMovieByTitleOrUrl as jest.Mock).mockResolvedValueOnce(
      null,
    );
    // Mas o update falha porque o ID que queremos atualizar não existe no banco
    (movieRepository.updateMovie as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      updateMoviesService("id-inexistente", { synopsis: "Nova sinopse" }),
    ).rejects.toThrow("Não foi possível atualizar. Filme não encontrado");
  });

  it("Deve atualizar o filme com sucesso quando os dados forem válidos", async () => {
    // Simulamos que não há conflito com outros filmes
    (movieRepository.findMovieByTitleOrUrl as jest.Mock).mockResolvedValueOnce(
      null,
    );

    // Simulamos o retorno de sucesso do repositório
    const mockAtualizado = {
      id: "meu-id-atual",
      title: "Titulo Atualizado",
      synopsis: "Nova sinopse",
    };
    (movieRepository.updateMovie as jest.Mock).mockResolvedValueOnce(
      mockAtualizado,
    );

    // Simulamos o payload enviando o próprio ID
    const payload = {
      id: "meu-id-atual", //
      title: "Titulo Atualizado",
      synopsis: "Nova sinopse",
    };

    const resultado = await updateMoviesService("meu-id-atual", payload);

    // Garante que o service removeu o ID do payload antes de mandar pro repositório
    expect(movieRepository.updateMovie).toHaveBeenCalledWith("meu-id-atual", {
      title: "Titulo Atualizado",
      synopsis: "Nova sinopse",
    });
    expect(resultado).toEqual(mockAtualizado);
  });
});
