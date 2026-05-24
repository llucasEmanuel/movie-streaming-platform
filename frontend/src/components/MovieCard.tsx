import type { Movie } from '../types';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="movie-card">
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div>{movie.duration} min</div>
        <br></br>
        <h4>{movie.genres.join(', ')}</h4>
        <br></br>
        <span>{movie.synopsis}</span>
      </div>
    </div>
  );
}