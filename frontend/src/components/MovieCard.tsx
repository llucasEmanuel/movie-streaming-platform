import type { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onAddToPlaylist?: (movie: Movie) => void;
}

export function MovieCard({ movie, onAddToPlaylist }: MovieCardProps) {
  return (
    <article className="movie-card">
      {movie.url_movie ? (
        <img src={movie.url_movie} alt={movie.title} />
      ) : (
        <div className="movie-card-placeholder">🎬</div>
      )}

      <div className="movie-info">
        <h2>{movie.title}</h2>

        {movie.synopsis && <p>{movie.synopsis}</p>}

        <p>
          <strong>Duração:</strong> {movie.duration} min
        </p>

        {movie.genres && movie.genres.length > 0 && (
          <p>
            <strong>Gêneros:</strong> {movie.genres.join(", ")}
          </p>
        )}

        {onAddToPlaylist && (
          <button
            className="movie-add-playlist-button"
            type="button"
            onClick={() => onAddToPlaylist(movie)}
          >
            Adicionar à playlist
          </button>
        )}
      </div>
    </article>
  );
}