import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService, ApiError } from '../services/movieService';
import { updateHistoryProgress } from '../services/historyApi';
import type { MovieMetadata } from '../types';
import './MovieDetail.css';

interface MovieDetailProps {
  userId?: string;
}

function resolveUserId(userId?: string) {
  if (userId) {
    return userId;
  }

  return (
    localStorage.getItem('userId') ??
    localStorage.getItem('currentUserId') ??
    sessionStorage.getItem('userId') ??
    new URLSearchParams(window.location.search).get('userId') ??
    ''
  );
}

export function MovieDetail({ userId }: MovieDetailProps) {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wasPlayingRef = useRef(false);
  const isSavingProgressRef = useRef(false);
  const resolvedUserId = resolveUserId(userId);

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
    wasPlayingRef.current = true;
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

  useEffect(() => {
    const shouldPersistProgress = wasPlayingRef.current && !isPlaying;

    if (!shouldPersistProgress) {
      wasPlayingRef.current = isPlaying;
      return;
    }

    wasPlayingRef.current = isPlaying;

    if (!movieId || !resolvedUserId) {
      return;
    }

    const currentPosition = Math.floor(
      videoRef.current?.currentTime ?? playbackPosition,
    );

    if (currentPosition <= 0) {
      return;
    }

    if (isSavingProgressRef.current) {
      return;
    }

    isSavingProgressRef.current = true;

    void updateHistoryProgress({
      id_user: resolvedUserId,
      id_movie: movieId,
      last_position: currentPosition,
    })
      .catch((err) => {
        console.warn('Erro ao salvar progresso do vídeo', err);
      })
      .finally(() => {
        isSavingProgressRef.current = false;
      });
  }, [isPlaying, movieId, playbackPosition, resolvedUserId]);

  function handleTimeUpdate() {
    const currentTime = videoRef.current?.currentTime ?? 0;

    if (currentTime > 0) {
      setPlaybackPosition(Math.floor(currentTime));
    }
  }

  function handleVideoEnded() {
    const currentTime = videoRef.current?.currentTime ?? 0;
    setPlaybackPosition(Math.floor(currentTime));
    setIsPlaying(false);
  }

  // 1. ADICIONADO: data-testid="loading-indicator" para o cenário de carregamento
  if (loading) {
    return (
      <div className="movie-detail">
        <div className="loading" data-testid="loading-indicator">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // 2. ADICIONADO: data-testid="error-message" e data-testid="btn-voltar" na tela de erro/não encontrado
  if (error || !movie) {
    return (
      <div className="movie-detail">
        <div className="error-container">
          <p className="error" data-testid="error-message">❌ {error || 'Filme não encontrado'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn-back"
            data-testid="btn-voltar"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      <title>CInema: Public Domain Streaming</title>
      
      {/* 3. ADICIONADO: data-testid="btn-voltar" no botão principal de retorno */}
      <button 
        onClick={() => navigate('/')} 
        className="btn-back"
        data-testid="btn-voltar"
      >
        ← Voltar
      </button>

      {isPlaying ? (
        <div className="video-player-container">
          <button onClick={handleCloseVideo} className="btn-close-video" data-testid="btn-close-video">
            ✕ Fechar
          </button>
          <video
            ref={videoRef}
            key={movieId}
            controls
            autoPlay
            className="video-player"
            src={movieId ? movieService.getVideoStreamUrl(movieId) : ''}
            onTimeUpdate={handleTimeUpdate}
            onPause={handleTimeUpdate}
            onEnded={handleVideoEnded}
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
                {/* 4. ADICIONADO: data-testid="btn-assistir" no botão de play */}
                <button 
                  onClick={handlePlayVideo} 
                  className="btn-play"
                  data-testid="btn-assistir"
                >
                  ▶ Assistir
                </button>
                <button onClick={handleDownload} className="btn-download">
                  ⬇ Download
                </button>
              </div>
            </div>

            <div className="movie-details-column">
              {/* 5. ADICIONADO: data-testid="movie-title" no título principal */}
              <h1 data-testid="movie-title">{movie.title}</h1>
              
              <div className="movie-info">
                {/* 6. ADICIONADO: data-testid="movie-synopsis" na sinopse */}
                <div className="info-section">
                  <p data-testid="movie-synopsis">{movie.synopsis || 'Sinopse não disponível'}</p>
                </div>

                <div className="info-grid">
                  {/* 7. ADICIONADO: data-testid="movie-genres" */}
                  <div className="info-item">
                    <label>Gêneros</label>
                    <p data-testid="movie-genres">{movie.genres || 'Não informado'}</p>
                  </div>

                  {/* 8. ADICIONADO: data-testid="movie-duration" */}
                  <div className="info-item">
                    <label>Duração</label>
                    <p data-testid="movie-duration">{movie.duration || 'Não informado'}</p>
                  </div>

                  <div className="info-item">
                    <label>Ano</label>
                    <p data-testid="movie-year">{movie.year || 'Não informado'}</p>
                  </div>

                  {/* 9. ADICIONADO: data-testid="movie-director" */}
                  <div className="info-item">
                    <label>Diretor</label>
                    <p data-testid="movie-director">{movie.director || 'Não informado'}</p>
                  </div>

                  {/* 10. ADICIONADO: data-testid="movie-cast" */}
                  <div className="info-item">
                    <label>Elenco</label>
                    <p data-testid="movie-cast">{movie.cast || 'Não informado'}</p>
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