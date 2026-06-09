import { useEffect, useState } from "react";
import { MovieCard } from "../../components/MovieCard";
import { Header } from "../../components/Header"; 
import { KeepWatchingCard } from "../../components/KeepWatchingCard"; // Certifique-se de que o card está importado
import { getMovies } from "../../services/movieApi";
import { movieService } from "../../services/movieService";
import { getUnfinishedMoviesByUserId } from "../../services/historyApi";
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
  onGoToRecommendations: () => void;
  onSelectMovie: (movie: Movie) => void;
  onGoToProfile?: () => void;
  onGoToAddMovie?: () => void;
  onGoToEditMovie?: (movie: Movie) => void;
  isAdmin?: boolean;
}

export function HomePage({ userId, isAdmin, onGoToPlaylists, onGoToHome, onGoToHistory, onGoToRecommendations, onSelectMovie, onGoToProfile, onGoToAddMovie, onGoToEditMovie }: HomePageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepWatchingMovies, setKeepWatchingMovies] = useState<{
    movieId: string;
    title: string;
    image?: string | null;
    progress_percentage: number;
    last_position: number; 
  }[]>([]);
  const [isLoadingKeepWatching, setIsLoadingKeepWatching] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [availablePlaylists, setAvailablePlaylists] = useState<Playlist[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  const [playlistMessage, setPlaylistMessage] = useState<PageMessage | null>(null);
  
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedMovieTitle, setDeletedMovieTitle] = useState<string | null>(null);

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

  useEffect(() => {
    let isMounted = true;

    async function loadKeepWatchingMovies() {
      try {
        setIsLoadingKeepWatching(true);

        const data = await getUnfinishedMoviesByUserId(userId);

        if (isMounted) {
          setKeepWatchingMovies(data);
        }
      } catch (err) {
        console.warn("Erro ao carregar filmes em andamento", err);

        if (isMounted) {
          setKeepWatchingMovies([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingKeepWatching(false);
        }
      }
    }

    loadKeepWatchingMovies();

    return () => {
      isMounted = false;
    };
  }, [userId]);

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

  async function handleResumeMovie(movieId: string, resumePosition: number) {
    try {
      // Busca os metadados completos do filme antes de navegar
      const metadata = await movieService.getMovieDetails(movieId);

      const movieToOpen: Movie = {
        id: metadata.id,
        title: metadata.title,
        url_movie: undefined,
        img_url: metadata.img_url,
        synopsis: metadata.synopsis,
        genres: metadata.genres,
        isPopular: false,
        duration: metadata.duration,
        director: metadata.director,
        cast: metadata.cast,
        createdAt: new Date().toISOString(),
        year: metadata.year,
        resumePosition,
      };

      onSelectMovie(movieToOpen);
    } catch (err) {
      console.error("Erro ao carregar metadados do filme para retomar:", err);
      // Fallback: navegar apenas com id e título mínimo
      onSelectMovie({ id: movieId, title: "Filme", genres: "", isPopular: false, createdAt: new Date().toISOString(), } as Movie);
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

  function handleDeleteMovie(movie: Movie) {
    setMovieToDelete(movie);
  }

  async function confirmDeleteMovie() {
    if (!movieToDelete) return;
    
    try {
      setIsDeleting(true);
      await movieService.deleteMovie(movieToDelete.id);
      setMovies(movies.filter((m) => m.id !== movieToDelete.id));
      setDeletedMovieTitle(movieToDelete.title);
      setMovieToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar filme.");
    } finally {
      setIsDeleting(false);
    }
  }

  function cancelDeleteMovie() {
    setMovieToDelete(null);
  }

  function handleEditMovie(movieToEdit: Movie) {
    if (onGoToEditMovie) {
      onGoToEditMovie(movieToEdit);
    }
  }

  return (
    <div className="home-page">
      <Header 
        activePage="home" 
        onGoToHome={onGoToHome}
        onGoToPlaylists={onGoToPlaylists}
        onGoToHistory={onGoToHistory}
        onGoToProfile={onGoToProfile}
        onGoToRecommendations={onGoToRecommendations}
        onGoToAddMovie={onGoToAddMovie}
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

          {isLoadingKeepWatching ? (
            <p className="catalog-empty-message">Carregando filmes em andamento...</p>
          ) : keepWatchingMovies.length === 0 ? (
            <p className="catalog-empty-message">Nenhum filme em andamento no momento.</p>
          ) : (
            <div className="keep-watching-scrollview">
              {keepWatchingMovies.map((item) => (
                <div key={item.movieId} className="keep-watching-scroll-item">
                  <KeepWatchingCard
                    title={item.title}
                    thumbnailUrl={item.image ?? undefined}
                    progressPercentage={item.progress_percentage}
                    onClick={() => handleResumeMovie(item.movieId, item.last_position)}
                  />
                </div>
              ))}
            </div>
          )}
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
                onDeleteMovie={isAdmin ? handleDeleteMovie : undefined}
                onEditMovie={isAdmin ? handleEditMovie : undefined}
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

      {/* Modal Confirmar Exclusão */}
      {movieToDelete && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1b1f] border-t-4 border-error rounded-xl p-8 flex flex-col items-center max-w-[400px] w-full shadow-2xl animate-slideUp">
            <div className="w-16 h-16 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-error text-[32px]">delete</span>
            </div>

            <h3 className="text-2xl text-on-background font-medium mb-2">Excluir Filme</h3>
            <p className="text-center text-on-surface-variant mb-8">
              Tem certeza que deseja excluir o filme <strong className="text-error">"{movieToDelete.title}"</strong> permanentemente?
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={confirmDeleteMovie}
                disabled={isDeleting}
                className="w-full py-3 bg-error text-on-error font-medium rounded hover:opacity-90 flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDeleting ? "hourglass_empty" : "delete_forever"}
                </span>
                {isDeleting ? "Excluindo..." : "Sim, excluir filme"}
              </button>
              <button
                onClick={cancelDeleteMovie}
                disabled={isDeleting}
                className="w-full py-3 bg-transparent border border-outline text-on-background font-medium rounded hover:bg-surface-container-highest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso (Pós-Exclusão) */}
      {deletedMovieTitle && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1b1f] border-t-4 border-[#ffc107] rounded-xl p-8 flex flex-col items-center max-w-[400px] w-full shadow-2xl animate-slideUp">
            <div className="w-16 h-16 bg-[#3f3100] border border-[#ffc107]/20 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[#ffc107] text-[32px]">check_circle</span>
            </div>

            <h3 className="text-2xl text-on-background font-medium mb-2">Excluído!</h3>
            <p className="text-center text-on-surface-variant mb-8">
              Filme <strong className="text-[#ffc107]">"{deletedMovieTitle}"</strong> foi excluído com sucesso do catálogo.
            </p>

            <div className="flex w-full">
              <button
                onClick={() => setDeletedMovieTitle(null)}
                className="w-full py-3 bg-[#ffc107] text-[#3f2e00] font-medium rounded hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                Voltar para o catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}