export interface Movie {
  id: string;
  title: string;
  url_movie?: string;
  img_url?: string;
  synopsis?: string;
  genres: string | string[];
  isPopular: boolean;
  duration?: string;
  director?: string;
  cast?: string;
  createdAt: string;
  year?: string;
}

export interface MovieMetadata {
  id: string;
  title: string;
  img_url?: string;
  synopsis: string;
  genres: string | string[];
  duration: string;
  director: string;
  cast: string;
  year: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  movies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface History {
  id: string;
  userId: string;
  movieId: string;
  watchedAt: string;
}

export type PageMessageType = "success" | "error" | "info";

export interface PageMessage {
  type: PageMessageType;
  text: string;
}