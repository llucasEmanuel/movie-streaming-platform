export interface MovieModel {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  duration: number;
  url_movie: string;
  url_poster?: string;
  isDeleted?: boolean;
  cast?: string[];
  directors?: string[];
  createdAt?: Date;
}