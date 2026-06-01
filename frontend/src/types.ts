export interface Movie {
  id: string;
  title: string;
  file_name?: string;
  synopsis?: string;
  genres: string;
  isPopular: boolean;
  duration?: string;
  director?: string;
  cast?: string;
  createdAt: string;
}

export interface MovieMetadata {
  id: string;
  title: string;
  synopsis: string;
  genres: string;
  duration: string;
  director: string;
  cast: string;
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