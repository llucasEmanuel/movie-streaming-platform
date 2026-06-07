import { useState } from "react";
import type { Movie } from "../../types";
import { movieService } from "../../services/movieService";
import "./MovieDetailsPage.css";

interface MovieDetailsPageProps {
  movie: Movie;
  userId: string;
  onGoToHome: () => void;
}

export function MovieDetailsPage({
  movie,
  userId,
  onGoToHome,
}: MovieDetailsPageProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleWatch() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:3000/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          movieId: movie.id,
        }),
      });

      if (!response.ok) {
        console.warn("Falha ao registrar visualização", response.status);
      }

      setIsWatching(true);
    } catch (error) {
      console.warn("Erro ao registrar visualização", error);
      setIsWatching(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    try {
      setIsDownloading(true);

      await movieService.downloadMovie(movie.id);

      alert(`✅ Download iniciado: ${movie.title}`);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao fazer download"
      );
    } finally {
      setIsDownloading(false);
    }
  }

  function handleBack() {
    if (isWatching) {
      setIsWatching(false);
      return;
    }

    onGoToHome();
  }

  const genres =
    movie.genres == null
      ? "N/A"
      : typeof movie.genres === "string"
      ? movie.genres || "N/A"
      : movie.genres.length > 0
      ? movie.genres.join(", ")
      : "N/A";

  return (
    <div className="movie-details-page">
      <button
        data-testid="btn-voltar"
        className="details-back-button"
        onClick={handleBack}
      >
        ← Voltar
      </button>

      {isLoading && (
        <div data-testid="loading-indicator" className="details-loading">
          Carregando...
        </div>
      )}

      {errorMessage && (
        <p data-testid="error-message" className="details-error">
          {errorMessage}
        </p>
      )}

      {isWatching ? (
        <div className="details-video-player">
          <video
            controls
            autoPlay
            className="details-video"
            src={movieService.getVideoStreamUrl(movie.id)}
            onError={() =>
              setErrorMessage(
                "Não foi possível carregar o filme. Verifique sua conexão ou tente novamente mais tarde"
              )
            }
          >
            Seu navegador não suporta vídeo HTML5.
          </video>
        </div>
      ) : (
        <div className="details-container">
          <div className="details-poster">
            {movie.img_url || movie.url_movie ? (
              <img src={movie.img_url ?? movie.url_movie} alt={movie.title} />
            ) : (
              <div className="details-poster-placeholder">🎬</div>
            )}
          </div>

          <div className="details-info">
            <h1 data-testid="movie-title">{movie.title ?? "N/A"}</h1>

            <div className="details-meta">

              <span data-testid="movie-year" className="details-meta-item">
                📅 {movie.year ?? "N/A"}
              </span>
              
              <span data-testid="movie-duration" className="details-meta-item">
                ⏱️ {movie.duration ? `${movie.duration} min` : "N/A"}
              </span>

              <span data-testid="movie-director" className="details-meta-item">
                🎬 {movie.director ?? "N/A"}
              </span>

              <span data-testid="movie-genres" className="details-meta-item">
                {genres}
              </span>
            </div>

            <div className="details-synopsis">
              <h2>Sinopse</h2>
              <p data-testid="movie-synopsis">{movie.synopsis ?? "N/A"}</p>
            </div>

            <div className="details-cast">
              <h2>Elenco</h2>
              <p data-testid="movie-cast">{movie.cast ?? "N/A"}</p>
            </div>

            <div className="details-actions">
              <button
                data-testid="btn-assistir"
                className="details-button details-button-watch"
                onClick={handleWatch}
                disabled={isWatching || isLoading}
              >
                {isLoading ? "⏳ Carregando..." : "▶️ Assistir Agora"}
              </button>

              <button
                data-testid="btn-download"
                className="details-button details-button-download"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? "📥 Iniciando download..." : "📥 Fazer Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}