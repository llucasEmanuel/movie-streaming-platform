export interface Movie {
  id: number;
  title: string;
  url_movie: string;
  duration: number;
  synopsis: string;
  genres: string[];
}

export interface Playlist {
  id: string;
  name: string;
  userId: string;
  movies: string[];
  createdAt: string;
  updatedAt: string;
}