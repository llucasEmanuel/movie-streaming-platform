import {
  createMovieService,
  deleteMovieService,
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
