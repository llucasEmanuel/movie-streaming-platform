const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface HistoryApiRecord {
  id: string;
  userId: string;
  movieId: string;
  watchedAt?: string;
  watched_at?: string;
  last_position: number;
  is_completed: boolean;
  is_hidden: boolean;
  title?: string;
}

export interface HistoryApiResponse {
  message?: string;
  data: HistoryApiRecord[];
}

export interface UnfinishedMovieApiRecord {
  movieId: string;
  title: string;
  image?: string | null;
  progress_percentage: number;
  last_position: number;
}

export interface UnfinishedMovieApiResponse {
  message?: string;
  data: UnfinishedMovieApiRecord[];
}

export interface UpdateProgressPayload {
  id_user: string;
  id_movie: string;
  last_position: number;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? "Erro inesperado");
  }

  return data;
}

export async function getHistoryByUserId(userId: string): Promise<HistoryApiRecord[]> {
  const response = await fetch(`${API_URL}/history/${userId}`);
  const data = await parseResponse<HistoryApiResponse>(response);

  return data.data ?? [];
}

export async function hideHistoryMovie(userId: string, movieId: string, watchedAt: string) {
  const response = await fetch(`${API_URL}/history/hide-movie`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_user: userId,
      id_movie: movieId,
      watched_at: watchedAt,
    }),
  });

  return parseResponse<{ message: string }>(response);
}

export async function hideAllHistory(userId: string) {
  const response = await fetch(`${API_URL}/history/hide-all`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_user: userId,
    }),
  });

  return parseResponse<{ message: string }>(response);
}

export async function getUnfinishedMoviesByUserId(userId: string): Promise<UnfinishedMovieApiRecord[]> {
  const response = await fetch(`${API_URL}/history/${userId}/unfinished`);
  const data = await parseResponse<UnfinishedMovieApiResponse>(response);

  return data.data ?? [];
}

export async function updateHistoryProgress(payload: UpdateProgressPayload) {
  const response = await fetch(`${API_URL}/history/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{ message: string }>(response);
}