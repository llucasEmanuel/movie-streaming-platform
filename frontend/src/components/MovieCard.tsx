import type { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
  onAddToPlaylist?: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
  onDeleteMovie?: (movie: Movie) => void;
  onEditMovie?: (movie: Movie) => void;
}

export function MovieCard({ movie, onAddToPlaylist, onSelectMovie, onDeleteMovie, onEditMovie }: MovieCardProps) {
  return (
    <article className="movie-card group" onClick={() => onSelectMovie?.(movie)}>
      <div className="relative w-full">
        {movie.img_url || movie.url_movie ? (
          <img src={movie.img_url ?? movie.url_movie} alt={movie.title} />
        ) : (
          <div className="movie-card-placeholder">🎬</div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          {onEditMovie && (
            <button
              type="button"
              className="bg-blue-600/90 text-white w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:scale-110 hover:bg-blue-700 shadow-md z-10"
              onClick={(e) => {
                e.stopPropagation();
                onEditMovie(movie);
              }}
              title="Editar filme"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          )}

          {onDeleteMovie && (
            <button
              type="button"
              className="bg-error text-on-error w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:scale-110 hover:bg-error/90 shadow-md z-10"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMovie(movie);
              }}
              title="Deletar filme"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="movie-info">
        <h2>{movie.title}</h2>

        {/*{movie.synopsis && <p>{movie.synopsis}</p>}*/}

        <p>
          <strong>Duração:</strong> {movie.duration}
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