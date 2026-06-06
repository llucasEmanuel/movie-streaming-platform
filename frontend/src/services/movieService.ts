import axios, { AxiosError } from 'axios';
import type { Movie, MovieMetadata } from '../types';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Classe para gerenciar erros de API
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Serviço de filmes
export const movieService = {
  /**
   * Busca todos os filmes
   */
  async getAllMovies(): Promise<Movie[]> {
    try {
      const response = await apiClient.get<Movie[]>('/movies');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Busca os detalhes de um filme específico
   * GET /movies/:moviesID
   */
  async getMovieDetails(movieId: string): Promise<MovieMetadata> {
    try {
      const response = await apiClient.get<MovieMetadata>(`/movies/${movieId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Obtém a URL de stream do vídeo
   * GET /movies/:moviesID/video
   */
  getVideoStreamUrl(movieId: string): string {
    return `${API_BASE_URL}/movies/${movieId}/video`;
  },

  /**
   * Obtém a URL para download do vídeo
   * GET /movies/:moviesID/download
   */
  getDownloadUrl(movieId: string): string {
    return `${API_BASE_URL}/movies/${movieId}/download`;
  },

  /**
   * Faz o download do vídeo usando o comportamento nativo do navegador.
   */
  async downloadMovie(movieId: string): Promise<void> {
    const downloadUrl = this.getDownloadUrl(movieId);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Cria um novo filme
   */
  async createMovie(movie: Omit<Movie, 'id' | 'createdAt'>): Promise<Movie> {
    try {
      const response = await apiClient.post<Movie>('/movies', movie);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Atualiza um filme
   */
  async updateMovie(
    movieId: string,
    updates: Partial<Movie>
  ): Promise<Movie> {
    try {
      const response = await apiClient.patch<Movie>(
        `/movies/${movieId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Deleta um filme
   */
  async deleteMovie(movieId: string): Promise<void> {
    try {
      await apiClient.delete(`/movies/${movieId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

/**
 * Função auxiliar para tratar erros de API
 */
function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status || 500;
    const message =
      (axiosError.response?.data as any)?.message ||
      axiosError.message ||
      'Erro ao comunicar com o servidor';

    return new ApiError(statusCode, message, axiosError.response?.data);
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message);
  }

  return new ApiError(500, 'Erro desconhecido ao comunicar com o servidor');
}
