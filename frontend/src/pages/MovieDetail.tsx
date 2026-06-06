import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, ApiError } from '../services/movieService';
import type { MovieMetadata } from '../types';
import './MovieDetail.css';

export function MovieDetail() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) {
        setError('ID do filme não encontrado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await movieService.getMovieDetails(movieId);
        setMovie(data);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.statusCode === 404) {
            setError('Filme não encontrado');
          } else {
            setError(err.message);
          }
        } else {
          setError('Erro ao carregar os detalhes do filme');
        }
        console.error('Erro ao buscar filme:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const handlePlayVideo = () => {
    if (!movieId) return;
    setIsPlaying(true);
  };

  const handleDownload = async () => {
    if (!movieId) return;
    try {
      await movieService.downloadMovie(movieId);
    } catch (err) {
      alert('Erro ao fazer download do filme');
      console.error('Erro no download:', err);
    }
  };

  const handleCloseVideo = () => {
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="loading">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail">
        <div className="error-container">
          <p className="error">❌ {error || 'Filme não encontrado'}</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      <title>CInema: Public Domain Streaming</title>
      <button onClick={() => navigate('/')} className="btn-back">
        ← Voltar
      </button>

      {isPlaying ? (
        <div className="video-player-container">
          <button onClick={handleCloseVideo} className="btn-close-video">
            ✕ Fechar
          </button>
          <video
            key={movieId}
            controls
            autoPlay
            className="video-player"
            src={movieId ? movieService.getVideoStreamUrl(movieId) : ''}
          >
            Seu navegador não suporta vídeo HTML5
          </video>
        </div>
      ) : (
        <div className="movie-content">
          <div className="movie-header">
            <div className="movie-poster-column">
              {movie.img_url && (
                <img src={movie.img_url} alt={movie.title} className="movie-poster-detail" />
              )}
              <div className="action-buttons">
                <button onClick={handlePlayVideo} className="btn-play">
                  ▶ Assistir
                </button>
                <button onClick={handleDownload} className="btn-download">
                  ⬇ Download
                </button>
              </div>
            </div>

            <div className="movie-details-column">
              <h1>{movie.title}</h1>
              <div className="movie-info">
                <div className="info-section">
                  <p>{movie.synopsis || 'Sinopse não disponível'}</p>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <label>Gêneros</label>
                    <p>{movie.genres || 'Não informado'}</p>
                  </div>

                  <div className="info-item">
                    <label>Duração</label>
                    <p>{movie.duration || 'Não informado'}</p>
                  </div>

                  <div className="info-item">
                    <label>Diretor</label>
                    <p>{movie.director || 'Não informado'}</p>
                  </div>

                  <div className="info-item">
                    <label>Elenco</label>
                    <p>{movie.cast || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
