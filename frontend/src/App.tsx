import { useEffect, useState } from 'react';
import { MovieCard } from './components/MovieCard'; // Importando o novo arquivo
import './App.css';
import type { Movie } from   './types';
import cinema_logo from './assets/cinema_logo.png';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/movies') // Sua rota do back que retorna o array
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar filmes');
        return res.json();
      })
      .then(data => setMovies(data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="container">
      <header>
        <img src={cinema_logo} width='300'></img>
      </header>

      {error && <p className="error">❌ {error}</p>}

      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default App; // O export default garante que o Fast Refresh funcione aqui