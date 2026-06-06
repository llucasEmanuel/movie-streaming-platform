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

  async function handleWatch() {
    setIsWatching(true);

    try {
      // Registrar no histórico sem bloquear a reprodução.
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
    } catch (error) {
      console.warn("Erro ao registrar visualização", error);
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

  return (
    <div className="movie-details-page">
      <button className="details-back-button" onClick={handleBack}>
        ← Voltar
      </button>

      {isWatching ? (
        <div className="details-video-player">
          <video
            controls
            autoPlay
            className="details-video"
            src={movieService.getVideoStreamUrl(movie.id)}
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
            <h1>{movie.title}</h1>

            <div className="details-meta">
              {movie.duration && (
                <span className="details-meta-item">
                  ⏱️ {movie.duration} min
                </span>
              )}

              {movie.director && (
                <span className="details-meta-item">🎬 {movie.director}</span>
              )}

              {movie.genres && (
                <span className="details-meta-item">
                  {typeof movie.genres === "string"
                    ? movie.genres
                    : movie.genres.join(", ")}
                </span>
              )}
            </div>

            {movie.synopsis && (
              <div className="details-synopsis">
                <h2>Sinopse</h2>
                <p>{movie.synopsis}</p>
              </div>
            )}

            {movie.cast && (
              <div className="details-cast">
                <h2>Elenco</h2>
                <p>{movie.cast}</p>
              </div>
            )}

            <div className="details-actions">
              <button
                className="details-button details-button-watch"
                onClick={handleWatch}
                disabled={isWatching}
              >
                {isWatching ? "⏳ Carregando..." : "▶️ Assistir Agora"}
              </button>

              <button
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
