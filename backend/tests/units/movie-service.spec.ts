import { createMovieService, deleteMovieService, updateMovieService } from '../../src/services/movie-service';
import { findMovieByTitleOrUrl, insertMovie, deleteMovie, updateMovie } from '../../src/repositories/movie-repository';
import { BadRequestError, ConflictError, ValidationError, NotFoundError } from '../../src/errors/errors';
import { MovieModel } from '../../src/models/movie-model';

// Realiza o mock do repositório para não acessar o banco de dados real
jest.mock('../../src/repositories/movie-repository', () => ({
  findMovieByTitleOrUrl: jest.fn(),
  insertMovie: jest.fn(),
  deleteMovie: jest.fn(),
  updateMovie: jest.fn(),
}));

describe('MovieService - createMovieService', () => {
  const validMoviePayload: Omit<MovieModel, "id" | "createdAt" | "isDeleted"> = {
    title: "O Senhor dos Anéis",
    synopsis: "Um anel para a todos governar",
    genres: ["Aventura", "Fantasia"],
    duration: 201,
    url_movie: "https://archive.org/download/senhor-dos-aneis/filme.mp4",
    url_poster: "https://archive.org/download/senhor-dos-aneis/poster.jpg",
    directors: ["Peter Jackson"],
    cast: ["Elijah Wood", "Ian McKellen"]
  };

  beforeEach(() => {
    // Limpa os registros de chamadas dos mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve criar um filme com sucesso se todos os dados forem válidos', async () => {
    // Simula que o filme NÃO existe no banco
    (findMovieByTitleOrUrl as jest.Mock).mockResolvedValue(null);
    // Simula a inserção retornando o filme com um ID gerado
    const createdMovie = { id: 'uuid-1234', ...validMoviePayload };
    (insertMovie as jest.Mock).mockResolvedValue(createdMovie);

    const result = await createMovieService(validMoviePayload);

    expect(findMovieByTitleOrUrl).toHaveBeenCalledWith(validMoviePayload.title, validMoviePayload.url_movie);
    expect(insertMovie).toHaveBeenCalledWith(validMoviePayload);
    expect(result).toEqual(createdMovie);
  });

  it('deve lançar BadRequestError se a lista de gêneros estiver vazia', async () => {
    const invalidPayload = { ...validMoviePayload, genres: [] };

    await expect(createMovieService(invalidPayload)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload)).rejects.toThrow("Necessário preencher os gêneros");
  });

  it('deve lançar BadRequestError se o título estiver em branco', async () => {
    const invalidPayload = { ...validMoviePayload, title: "   " };

    await expect(createMovieService(invalidPayload)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload)).rejects.toThrow("O título é obrigatório");
  });

  it('deve lançar BadRequestError se a URL do filme não utilizar protocolo seguro (https)', async () => {
    const invalidPayload = { ...validMoviePayload, url_movie: "http://archive.org/download/senhor-dos-aneis/filme.mp4" };

    await expect(createMovieService(invalidPayload)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload)).rejects.toThrow("A URL do filme deve utilizar uma conexão segura");
  });

  it('deve lançar BadRequestError se a origem do vídeo não for o archive.org', async () => {
    const invalidPayload = { ...validMoviePayload, url_movie: "https://youtube.com/watch?v=123" };

    await expect(createMovieService(invalidPayload)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload)).rejects.toThrow("Origem do vídeo não autorizada");
  });

  it('deve lançar BadRequestError se a duração não for preenchida', async () => {
    // @ts-ignore para forçar um payload inválido
    const invalidPayload = { ...validMoviePayload, duration: undefined };

    await expect(createMovieService(invalidPayload as any)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload as any)).rejects.toThrow("A duração do filme é obrigatória");
  });

  it('deve lançar BadRequestError se o poster não for preenchido', async () => {
    const invalidPayload = { ...validMoviePayload, url_poster: "" };

    await expect(createMovieService(invalidPayload)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload)).rejects.toThrow("O poster do filme é obrigatório");
  });

  it('deve lançar BadRequestError se a sinopse não for preenchida', async () => {
    const invalidPayload = { ...validMoviePayload, synopsis: "" };

    await expect(createMovieService(invalidPayload)).rejects.toThrow(BadRequestError);
    await expect(createMovieService(invalidPayload)).rejects.toThrow("A sinopse do filme é obrigatória");
  });

  it('deve lançar ConflictError se o filme já existir no banco (mesmo título ou URL)', async () => {
    // Simula que o repositório encontrou um filme existente
    (findMovieByTitleOrUrl as jest.Mock).mockResolvedValue({ id: 'uuid-999', title: validMoviePayload.title });

    await expect(createMovieService(validMoviePayload)).rejects.toThrow(ConflictError);
    await expect(createMovieService(validMoviePayload)).rejects.toThrow("Este filme já existe na base de dados");
    
    // Confirma que a inserção NÃO foi chamada
    expect(insertMovie).not.toHaveBeenCalled();
  });

});

describe('MovieService - deleteMovieService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve deletar um filme com sucesso se o ID for válido e existir', async () => {
    (deleteMovie as jest.Mock).mockResolvedValue(true);

    await deleteMovieService('uuid-1234');

    expect(deleteMovie).toHaveBeenCalledWith('uuid-1234');
  });

  it('deve lançar ValidationError se o ID estiver em branco', async () => {
    await expect(deleteMovieService('   ')).rejects.toThrow(ValidationError);
    await expect(deleteMovieService('   ')).rejects.toThrow("ID do filme deve ser informado");
    
    expect(deleteMovie).not.toHaveBeenCalled();
  });

  it('deve lançar ValidationError se o ID não for informado', async () => {
    await expect(deleteMovieService('')).rejects.toThrow(ValidationError);
    await expect(deleteMovieService('')).rejects.toThrow("ID do filme deve ser informado");
    
    expect(deleteMovie).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundError se o filme não existir no banco de dados', async () => {
    (deleteMovie as jest.Mock).mockResolvedValue(false);

    await expect(deleteMovieService('uuid-nao-existe')).rejects.toThrow(NotFoundError);
    await expect(deleteMovieService('uuid-nao-existe')).rejects.toThrow("Impossível excluir! Não existe esse filme na base de dados");
    
    expect(deleteMovie).toHaveBeenCalledWith('uuid-nao-existe');
  });
});

describe('MovieService - updateMovieService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve atualizar o filme com sucesso se o ID e os dados forem válidos', async () => {
    const mockUpdates = { duration: 300, synopsis: "Nova sinopse" };
    const mockUpdatedMovie = { id: 'uuid-1234', title: 'Senhor dos Anéis', ...mockUpdates };
    
    (updateMovie as jest.Mock).mockResolvedValue(mockUpdatedMovie);

    const result = await updateMovieService('uuid-1234', mockUpdates);

    expect(updateMovie).toHaveBeenCalledWith('uuid-1234', mockUpdates);
    expect(result).toEqual(mockUpdatedMovie);
  });

  it('deve lançar ValidationError se o ID estiver em branco', async () => {
    await expect(updateMovieService('   ', { title: 'Novo Titulo' })).rejects.toThrow(ValidationError);
    await expect(updateMovieService('   ', { title: 'Novo Titulo' })).rejects.toThrow("ID do filme deve ser informado");
    
    expect(updateMovie).not.toHaveBeenCalled();
  });

  it('deve lançar ValidationError se o ID não for informado', async () => {
    await expect(updateMovieService('', { title: 'Novo Titulo' })).rejects.toThrow(ValidationError);
    await expect(updateMovieService('', { title: 'Novo Titulo' })).rejects.toThrow("ID do filme deve ser informado");
    
    expect(updateMovie).not.toHaveBeenCalled();
  });

  it('deve lançar ValidationError se tentarem alterar o ID do filme', async () => {
    await expect(updateMovieService('uuid-1234', { id: 'uuid-hacker' })).rejects.toThrow(ValidationError);
    await expect(updateMovieService('uuid-1234', { id: 'uuid-hacker' })).rejects.toThrow("Não é permitido alterar o ID de um filme existente");
    
    expect(updateMovie).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundError se o filme não for encontrado no banco para atualizar', async () => {
    (updateMovie as jest.Mock).mockResolvedValue(null);

    await expect(updateMovieService('uuid-nao-existe', { duration: 100 })).rejects.toThrow(NotFoundError);
    await expect(updateMovieService('uuid-nao-existe', { duration: 100 })).rejects.toThrow("Não foi possível atualizar. Filme não encontrado");
    
    expect(updateMovie).toHaveBeenCalledWith('uuid-nao-existe', { duration: 100 });
  });
});
