import { useState } from "react";
import type { Movie } from "../../types";
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
  const [downloadProgress, setDownloadProgress] = useState(0);

  async function handleWatch() {
    try {
      setIsWatching(true);

      // Registrar no histórico
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
        throw new Error("Erro ao registrar visualização");
      }

      // Simulação de reprodução do vídeo
      alert(`▶️ Reproduzindo: ${movie.title}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao iniciar reprodução"
      );
    } finally {
      setIsWatching(false);
    }
  }

  async function handleDownload() {
    try {
      // Simulação de download
      setDownloadProgress(0);

      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            alert(`✅ Download concluído: ${movie.title}`);
            setDownloadProgress(0);
            return 0;
          }
          return prev + Math.random() * 30;
        });
      }, 500);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao fazer download"
      );
    }
  }

  return (
    <div className="movie-details-page">
      <button className="details-back-button" onClick={onGoToHome}>
        ← Voltar
      </button>

      <div className="details-container">
        <div className="details-poster">
          {movie.url_movie ? (
            <img src={movie.url_movie} alt={movie.title} />
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
              disabled={downloadProgress > 0 && downloadProgress < 100}
            >
              {downloadProgress > 0 && downloadProgress < 100
                ? `📥 Baixando ${Math.round(downloadProgress)}%`
                : "📥 Fazer Download"}
            </button>
          </div>

          {downloadProgress > 0 && downloadProgress < 100 && (
            <div className="details-progress">
              <div
                className="details-progress-bar"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
