import { useEffect, useState } from "react";
import { MovieCard } from "./components/MovieCard";
import "./App.css";
import type { Movie, Playlist } from "./types";
import cinema_logo from "./assets/cinema_logo.png";
import { MinhasPlaylistsPage } from "./pages/MinhasPlaylists/MinhasPlaylistsPage";
import {
  addMovieToPlaylist,
  getPlaylistsByUserId,
} from "./services/playlistApi";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const USER_ID = "Victoria";

type CurrentPage = "home" | "playlists";
type MessageType = "success" | "error" | "info";

interface PageMessage {
  type: MessageType;
  text: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>("home");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [availablePlaylists, setAvailablePlaylists] = useState<Playlist[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  const [playlistMessage, setPlaylistMessage] = useState<PageMessage | null>(
    null,
  );

  useEffect(() => {
    if (currentPage !== "home") {
      return;
    }

    setLoadingMovies(true);

    fetch(`${API_URL}/movies`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar filmes");
        }

        return res.json();
      })
      .then((data) => {
        setMovies(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoadingMovies(false);
      });
  }, [currentPage]);

  async function openAddMovieToPlaylistModal(movie: Movie) {
    try {
      setSelectedMovie(movie);
      setAvailablePlaylists([]);
      setPlaylistMessage(null);
      setIsPlaylistModalOpen(true);
      setIsLoadingPlaylists(true);

      const data = await getPlaylistsByUserId(USER_ID);

      setAvailablePlaylists(data.playlists);

      if (data.playlists.length === 0) {
        setPlaylistMessage({
          type: "info",
          text: "Não existem playlists disponíveis",
        });
      }
    } catch (error) {
      setPlaylistMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
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
        userId: USER_ID,
        playlistName,
        movieName: selectedMovie.title,
      });

      setPlaylistMessage({
        type: "success",
        text: data.message,
      });

      closePlaylistModal();
    } catch (error) {
      setPlaylistMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao adicionar filme à playlist",
      });
    }
  }

  if (currentPage === "playlists") {
    return (
      <MinhasPlaylistsPage
        onGoToHome={() => setCurrentPage("home")}
      />
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <img src={cinema_logo} width="300" alt="Cinema" />

        <nav className="home-nav">
          <button
            className="home-nav-button active"
            type="button"
          >
            Página Principal
          </button>

          <button
            className="home-nav-button"
            type="button"
            onClick={() => setCurrentPage("playlists")}
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

        {error && <p className="error">❌ {error}</p>}

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

export default App;