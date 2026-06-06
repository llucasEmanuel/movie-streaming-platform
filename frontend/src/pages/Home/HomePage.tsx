import { useEffect, useState } from "react";
import { MovieCard } from "../../components/MovieCard";
import { Header } from "../../components/Header"; 
import { KeepWatchingCard } from "../../components/KeepWatchingCard"; // Certifique-se de que o card está importado
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
  onGoToHome?: () => void;
  onGoToHistory: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export function HomePage({ userId, onGoToPlaylists, onGoToHome, onGoToHistory, onSelectMovie }: HomePageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [availablePlaylists, setAvailablePlaylists] = useState<Playlist[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  const [playlistMessage, setPlaylistMessage] = useState<PageMessage | null>(null);

  // Lista fictícia/mockada apenas para você ver o carrossel funcionando antes de ligar à API
  const keepWatchingMovies = [
    { id: 1, title: "13 Going on 30", percentage: 75, thumb: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60" },
    { id: 2, title: "Twilight", percentage: 40, thumb: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60" },
    { id: 3, title: "O Poderoso Chefão", percentage: 90, thumb: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=60" },
  ];

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
      {/* HEADER COMPONENTIZADO RECEBENDO AS AÇÕES DA PÁGINA */}
      <Header 
        activePage="home" 
        onGoToHome={onGoToHome}
        onGoToPlaylists={onGoToPlaylists}
        onLogout={() => {
          console.log("Usuário deslogado");
        }}
        onGoToHistory={onGoToHistory}
      />

      <main className="home-content">
        <section className="home-hero">
          <p className="home-eyebrow">Catálogo</p>
          <h1>Página Principal</h1>
          <p>
            Explore o catálogo de filmes e organize seus favoritos in playlists.
          </p>
        </section>

        {error && <p className="home-error">❌ {error}</p>}

        {!isPlaylistModalOpen && playlistMessage && (
          <p className={`catalog-playlist-message ${playlistMessage.type}`}>
            {playlistMessage.text}
          </p>
        )}

        {/* 🚀 SEÇÃO ADICIONADA: CONTINUAR ASSISTINDO (CARROSSEL) */}
        <section className="keep-watching-section">
          <div className="section-title-wrapper">
            <h2>Continuar Assistindo</h2>
            <div className="section-title-line"></div> {/* Linha que vai até o outro lado */}
          </div>
          
          {/* Espaço reservado para o carrossel horizontal */}
          <div className="keep-watching-scrollview">
            {keepWatchingMovies.map((item) => (
              <div key={item.id} className="keep-watching-scroll-item">
                <KeepWatchingCard
                  title={item.title}
                  thumbnailUrl={item.thumb}
                  progressPercentage={item.percentage}
                  onClick={() => console.log(`Clicou no filme: ${item.title}`)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO ORIGINAL DO GRID DE FILMES */}
        <section className="catalog-section">
          <div className="section-title-wrapper">
            <h2>Todos os Filmes</h2>
            <div className="section-title-line"></div> {/* Linha que vai até o outro lado */}
          </div>

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
              onSelectMovie={onSelectMovie}
            />
          ))}
        </div>
      </section>
      </main>

      {/* MODAL DE PLAYLIST */}
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