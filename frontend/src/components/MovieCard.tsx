import type { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onAddToPlaylist?: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
}

export function MovieCard({ movie, onAddToPlaylist, onSelectMovie }: MovieCardProps) {
  return (
    <article className="movie-card" onClick={() => onSelectMovie?.(movie)}>
      {movie.img_url || movie.url_movie ? (
        <img src={movie.img_url ?? movie.url_movie} alt={movie.title} />
      ) : (
        <div className="movie-card-placeholder">🎬</div>
      )}

      <div className="movie-info">
        <h2>{movie.title}</h2>

        {/*{movie.synopsis && <p>{movie.synopsis}</p>}*/}

        <p>
          <strong>Duração:</strong> {movie.duration} min
        </p>

        {movie.genres && (
          <p>
            <strong>Gêneros:</strong> {typeof movie.genres === "string" ? movie.genres : movie.genres.join(", ")}
          </p>
        )}

        {onAddToPlaylist && (
          <button
            className="movie-add-playlist-button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(movie);
            }}
          >
            Adicionar à playlist
          </button>
        )}
      </div>
    </article>
  );
}