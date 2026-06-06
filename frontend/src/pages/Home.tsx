import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService, ApiError } from '../services/movieService';
import { MovieCard } from '../components/MovieCard';
import type { Movie } from '../types';
import './Home.css';

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await movieService.getAllMovies();
        setMovies(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Erro ao carregar os filmes');
        }
        console.error('Erro ao buscar filmes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="home">
        <div className="loading">
          <p>Carregando filmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {error && <p className="error">❌ {error}</p>}
      <title>CInema: Public Domain Streaming</title>

      <div className="movies-grid">
        {movies.length === 0 ? (
          <p className="no-movies">Nenhum filme disponível no momento</p>
        ) : (
          movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              role="button"
              tabIndex={0}
            >
              <MovieCard movie={movie} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
