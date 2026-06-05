import { useEffect, useState } from "react";
import cinemaLogo from "../../assets/cinema_logo.png";
import { MovieCard } from "../../components/MovieCard";
import { getMovies } from "../../services/movieApi";
import {
  addMovieToPlaylist,
  getPlaylistsByUserId,
} from "../../services/playlistApi";
import type { Movie, PageMessage, Playlist } from "../../types";
import "./HomePage.css";

interface HomePageProps {
  userId: string;
  onGoToPlaylists: () => void;
}

export function HomePage({ userId, onGoToPlaylists }: HomePageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [availablePlaylists, setAvailablePlaylists] = useState<Playlist[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  const [playlistMessage, setPlaylistMessage] = useState<PageMessage | null>(
    null,
  );

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoadingMovies(true);
        setError(null);

        const data = await getMovies();

        setMovies(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro inesperado ao buscar filmes",
        );
      } finally {
        setLoadingMovies(false);
      }
    }

    loadMovies();
  }, []);

  async function openAddMovieToPlaylistModal(movie: Movie) {
    try {
      setSelectedMovie(movie);
      setAvailablePlaylists([]);
      setPlaylistMessage(null);
      setIsPlaylistModalOpen(true);
      setIsLoadingPlaylists(true);

      const data = await getPlaylistsByUserId(userId);

      setAvailablePlaylists(data.playlists);

      if (data.playlists.length === 0) {
        setPlaylistMessage({
          type: "info",
          text: "Não existem playlists disponíveis",
        });
      }
    } catch (err) {
      setPlaylistMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao buscar playlists disponíveis",
      });
    } finally {
      setIsLoadingPlaylists(false);
    }
  }

  function closePlaylistModal() {
    setSelectedMovie(null);
    setAvailablePlaylists([]);
    setIsPlaylistModalOpen(false);
    setIsLoadingPlaylists(false);
  }

  async function handleAddMovieToPlaylist(playlistName: string) {
    if (!selectedMovie) {
      return;
    }

    try {
      const data = await addMovieToPlaylist({
        userId,
        playlistName,
        movieName: selectedMovie.title,
      });

      setPlaylistMessage({
        type: "success",
        text: data.message,
      });

      closePlaylistModal();
    } catch (err) {
      setPlaylistMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao adicionar filme à playlist",
      });
    }
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <img src={cinemaLogo} width="300" alt="Cinema" />

        <nav className="home-nav">
          <button className="home-nav-button active" type="button">
            Página Principal
          </button>

          <button
            className="home-nav-button"
            type="button"
            onClick={onGoToPlaylists}
          >
            Minhas Playlists
          </button>
        </nav>
      </header>

      <main className="home-content">
        <section className="home-hero">
          <p className="home-eyebrow">Catálogo</p>
          <h1>Página Principal</h1>
          <p>
            Explore o catálogo de filmes e organize seus favoritos em playlists.
          </p>
        </section>

        {error && <p className="home-error">❌ {error}</p>}

        {!isPlaylistModalOpen && playlistMessage && (
          <p className={`catalog-playlist-message ${playlistMessage.type}`}>
            {playlistMessage.text}
          </p>
        )}

        {loadingMovies && (
          <p className="catalog-empty-message">Carregando filmes...</p>
        )}

        {!loadingMovies && movies.length === 0 && !error && (
          <p className="catalog-empty-message">
            Nenhum filme encontrado no catálogo.
          </p>
        )}

        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onAddToPlaylist={openAddMovieToPlaylistModal}
            />
          ))}
        </div>
      </main>

      {isPlaylistModalOpen && selectedMovie && (
        <div className="catalog-modal-backdrop">
          <section className="catalog-modal">
            <div className="catalog-modal-header">
              <div>
                <p>Adicionar à playlist</p>
                <h2>{selectedMovie.title}</h2>
              </div>

              <button type="button" onClick={closePlaylistModal}>
                ×
              </button>
            </div>

            {playlistMessage && (
              <p className={`catalog-playlist-message ${playlistMessage.type}`}>
                {playlistMessage.text}
              </p>
            )}

            {isLoadingPlaylists && (
              <p className="catalog-empty-playlists">
                Carregando playlists disponíveis...
              </p>
            )}

            {!isLoadingPlaylists && availablePlaylists.length === 0 && (
              <div className="catalog-empty-playlists">
                <p>Não existem playlists disponíveis</p>
              </div>
            )}

            {!isLoadingPlaylists && availablePlaylists.length > 0 && (
              <div className="catalog-playlist-options">
                {availablePlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => handleAddMovieToPlaylist(playlist.name)}
                  >
                    <strong>{playlist.name}</strong>

                    <span>
                      {playlist.movies.length === 0
                        ? "Nenhum filme adicionado"
                        : `${playlist.movies.length} filme(s)`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}