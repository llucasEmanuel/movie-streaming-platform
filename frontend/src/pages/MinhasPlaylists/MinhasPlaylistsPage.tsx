import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { PageMessage, Playlist } from "../../types";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistsByUserId,
  removeMovieFromPlaylist,
  updatePlaylist,
} from "../../services/playlistApi";
import cinemaLogo from "../../assets/cinema_logo.png";
import "./MinhasPlaylistsPage.css";

interface MinhasPlaylistsPageProps {
  userId: string;
  onGoToHome: () => void;
}

export function MinhasPlaylistsPage({
  userId,
  onGoToHome,
}: MinhasPlaylistsPageProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState<PageMessage | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );

  const selectedPlaylist =
    playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? null;

  const hasPlaylists = playlists.length > 0;

  useEffect(() => {
    async function loadPlaylists() {
      try {
        setLoading(true);

        const data = await getPlaylistsByUserId(userId);

        setPlaylists(data.playlists);

        if (data.playlists.length === 0) {
          setMessage({
            type: "info",
            text: "Ainda não existem playlists criadas",
          });
        } else {
          setMessage(null);
        }
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Erro inesperado ao buscar playlists",
        });
      } finally {
        setLoading(false);
      }
    }

    void loadPlaylists();
  }, [userId]);

  function openCreateModal() {
    setEditingPlaylist(null);
    setPlaylistName("");
    setIsModalOpen(true);
    setMessage(null);
  }

  function openEditModal(playlist: Playlist) {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setIsModalOpen(true);
    setMessage(null);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPlaylist(null);
    setPlaylistName("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = playlistName.trim();

    if (!trimmedName) {
      setMessage({
        type: "error",
        text: "O nome da playlist é obrigatório",
      });
      return;
    }

    try {
      if (editingPlaylist) {
        const data = await updatePlaylist(editingPlaylist.id, {
          name: trimmedName,
        });

        setPlaylists((currentPlaylists) =>
          currentPlaylists.map((playlist) =>
            playlist.id === editingPlaylist.id ? data.playlist : playlist,
          ),
        );

        setMessage({
          type: "success",
          text: data.message,
        });
      } else {
        const data = await createPlaylist({
          name: trimmedName,
          userId,
        });

        setPlaylists((currentPlaylists) => [
          data.playlist,
          ...currentPlaylists,
        ]);

        setMessage({
          type: "success",
          text: data.message,
        });
      }

      closeModal();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao salvar playlist",
      });
    }
  }

  async function handleDelete(playlist: Playlist) {
    const confirmed = window.confirm(
      `Deseja remover a playlist "${playlist.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deletePlaylist(playlist.id);

      setPlaylists((currentPlaylists) =>
        currentPlaylists.filter((item) => item.id !== playlist.id),
      );

      if (selectedPlaylistId === playlist.id) {
        setSelectedPlaylistId(null);
      }

      setMessage({
        type: "success",
        text: data.message,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao remover playlist",
      });
    }
  }

  async function handleRemoveMovie(playlist: Playlist, movieName: string) {
    try {
      const data = await removeMovieFromPlaylist({
        userId,
        playlistName: playlist.name,
        movieName,
      });

      setPlaylists((currentPlaylists) =>
        currentPlaylists.map((item) =>
          item.id === playlist.id ? data.playlist : item,
        ),
      );

      setMessage({
        type: "success",
        text: data.message,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao remover filme da playlist",
      });
    }
  }

  return (
    <div className="playlist-shell">
      <aside className="playlist-sidebar">
        <button
          className="playlist-logo"
          type="button"
          onClick={onGoToHome}
          aria-label="Ir para a página principal"
        >
          <img src={cinemaLogo} alt="CInema Filmes Antigos" />
        </button>

        <nav className="playlist-menu">
          <button
            className="playlist-menu-item"
            type="button"
            onClick={onGoToHome}
          >
            <span>⌂</span>
            Página Principal
          </button>

          <button
            className="playlist-menu-item active"
            type="button"
            onClick={() => setSelectedPlaylistId(null)}
          >
            <span>≡+</span>
            Minhas Playlists
          </button>
        </nav>
      </aside>

      <div className="playlist-main">
        <header className="playlist-topbar">
          <div>
            <p className="playlist-eyebrow">
              {selectedPlaylist ? "Playlist" : "Biblioteca pessoal"}
            </p>

            <h1>
              {selectedPlaylist ? selectedPlaylist.name : "Minhas Playlists"}
            </h1>
          </div>

          <div className="playlist-topbar-actions">
            <button
              className="playlist-secondary-button"
              type="button"
              onClick={onGoToHome}
            >
              Voltar para Página Principal
            </button>

            {!selectedPlaylist && hasPlaylists && (
              <button
                className="playlist-primary-button"
                type="button"
                onClick={openCreateModal}
              >
                <span>+</span>
                Criar Nova Playlist
              </button>
            )}

            {selectedPlaylist && (
              <button
                className="playlist-secondary-button"
                type="button"
                onClick={() => setSelectedPlaylistId(null)}
              >
                Voltar para Minhas Playlists
              </button>
            )}
          </div>
        </header>

        <main className="playlist-content">
          {message && (
            <div className={`playlist-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {loading && <p className="playlist-loading">Carregando playlists...</p>}

          {!loading && selectedPlaylist && (
            <section className="playlist-detail-section">
              <div className="playlist-list-header">
                <div>
                  <p className="playlist-eyebrow">Filmes adicionados</p>
                  <h2>{selectedPlaylist.name}</h2>
                </div>

                <span>
                  {selectedPlaylist.movies.length} filme(s) na playlist
                </span>
              </div>

              {selectedPlaylist.movies.length === 0 ? (
                <div className="playlist-movies-empty">
                  <h3>Nenhum filme adicionado</h3>
                  <p>Esta playlist ainda não possui filmes adicionados.</p>
                </div>
              ) : (
                <div className="playlist-movies-grid">
                  {selectedPlaylist.movies.map((movieName) => (
                    <article className="playlist-movie-card" key={movieName}>
                      <div className="playlist-movie-poster">🎬</div>

                      <div className="playlist-movie-info">
                        <h3>{movieName}</h3>
                        <p>Filme salvo em {selectedPlaylist.name}</p>

                        <button
                          className="playlist-danger-button"
                          type="button"
                          onClick={() =>
                            handleRemoveMovie(selectedPlaylist, movieName)
                          }
                        >
                          Remover da playlist
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {!loading && !selectedPlaylist && !hasPlaylists && (
            <section className="playlist-empty-state">
              <div className="playlist-empty-card">
                <span className="playlist-empty-back-icon">▤</span>
                <span className="playlist-empty-front-icon">≡+</span>
                <span className="playlist-empty-dot" />
              </div>

              <h2>Nenhuma playlist encontrada</h2>

              <p>
                Comece a organizar seus clássicos favoritos criando sua primeira
                playlist.
              </p>

              <button
                className="playlist-primary-button big"
                type="button"
                onClick={openCreateModal}
              >
                <span>+</span>
                Criar Nova Playlist
              </button>

              <div className="playlist-placeholder-grid">
                <div />
                <div />
                <div />
              </div>
            </section>
          )}

          {!loading && !selectedPlaylist && hasPlaylists && (
            <section className="playlist-list-section">
              <div className="playlist-list-header">
                <div>
                  <p className="playlist-eyebrow">Organização</p>
                  <h2>Suas playlists</h2>
                </div>

                <span>{playlists.length} playlist(s)</span>
              </div>

              <div className="playlist-grid">
                {playlists.map((playlist) => (
                  <article className="playlist-card" key={playlist.id}>
                    <div className="playlist-card-cover">≡</div>

                    <div className="playlist-card-body">
                      <h3>{playlist.name}</h3>

                      <p>
                        {playlist.movies.length === 0
                          ? "Nenhum filme adicionado"
                          : `${playlist.movies.length} filme(s)`}
                      </p>

                      <div className="playlist-card-actions">
                        <button
                          className="playlist-primary-button"
                          type="button"
                          onClick={() => setSelectedPlaylistId(playlist.id)}
                        >
                          Abrir
                        </button>

                        <button
                          className="playlist-secondary-button"
                          type="button"
                          onClick={() => openEditModal(playlist)}
                        >
                          Editar
                        </button>

                        <button
                          className="playlist-danger-button"
                          type="button"
                          onClick={() => handleDelete(playlist)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="playlist-modal-backdrop">
          <section className="playlist-modal">
            <div className="playlist-modal-header">
              <div>
                <p className="playlist-eyebrow">
                  {editingPlaylist ? "Editar playlist" : "Nova playlist"}
                </p>

                <h2>
                  {editingPlaylist
                    ? "Alterar nome da playlist"
                    : "Criar nova playlist"}
                </h2>
              </div>

              <button
                className="playlist-close-button"
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="playlist-form" onSubmit={handleSubmit}>
              <label htmlFor="playlist-name">Nome da playlist</label>

              <input
                id="playlist-name"
                type="text"
                placeholder="Ex: Filmes clássicos"
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                autoFocus
              />

              <div className="playlist-form-actions">
                <button
                  type="button"
                  className="playlist-secondary-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="playlist-primary-button">
                  {editingPlaylist ? "Salvar alterações" : "Criar Playlist"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}