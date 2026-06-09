import React, { useState } from 'react';
import { movieService } from '../../services/movieService';
import type { Movie } from '../../types';
import { SuccessModal } from './SuccessModal';
import { ConfirmEditModal } from './ConfirmEditModal';
interface AddMovieProps {
  onCancel: () => void;
  movieToEdit?: Movie | null;
}

export function AddMovie({ onCancel, movieToEdit }: AddMovieProps) {
  const isEditing = !!movieToEdit;

  const [title, setTitle] = useState(movieToEdit?.title || '');
  const [synopsis, setSynopsis] = useState(movieToEdit?.synopsis || '');

  // Extract number from "120 min" or similar if present
  const parseDuration = (dur?: string | number) => dur ? String(dur).replace(/\D/g, '') : '';
  const [duration, setDuration] = useState(parseDuration(movieToEdit?.duration));

  const [isPopular, setIsPopular] = useState(movieToEdit?.isPopular || false);
  const [director, setDirector] = useState(movieToEdit?.director || '');
  const [cast, setCast] = useState(movieToEdit?.cast || '');
  // Assuming genre might be a single string or array
  const initialGenre = movieToEdit?.genres
    ? (Array.isArray(movieToEdit.genres) ? movieToEdit.genres[0] : movieToEdit.genres)
    : '';
  const [genre, setGenre] = useState(initialGenre || '');

  const [movieUrl, setMovieUrl] = useState(movieToEdit?.url_movie || movieToEdit?.file_name || '');
  // Frontend usa img_url quando recebe do backend
  const [posterUrl, setPosterUrl] = useState(movieToEdit?.img_url || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  const handleAddAnother = () => {
    setTitle('');
    setSynopsis('');
    setDuration('');
    setIsPopular(false);
    setDirector('');
    setCast('');
    setGenre('');
    setMovieUrl('');
    setPosterUrl('');
    setShowSuccessModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !movieUrl) {
      setErrorMsg("O título e a URL do vídeo são obrigatórios!");
      return;
    }

    if (isEditing) {
      setShowEditConfirmModal(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        title,
        synopsis,
        genres: genre ? [genre] : [],
        duration: duration ? `${duration} min` : undefined,
        url_movie: movieUrl,
        url_poster: posterUrl,
        isPopular: isPopular,
        director: director || undefined,
        cast: cast || undefined,
      };

      if (isEditing && movieToEdit) {
        await movieService.updateMovie(movieToEdit.id, payload);
      } else {
        await movieService.createMovie({ ...payload });
      }

      setShowEditConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Erro ao salvar filme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 p-gutter w-full max-w-container-max mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">
            {isEditing ? "Editar Filme" : "Adicionar Novo Filme"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isEditing ? "Atualize as informações técnicas e o pôster." : "Preencha as informações técnicas e envie o pôster para registrar a obra no catálogo."}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="px-6 py-2 border border-outline text-on-background font-label-sm text-label-sm rounded-DEFAULT hover:bg-surface-container-highest transition-colors uppercase tracking-wider disabled:opacity-50"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2 bg-primary-container text-on-primary font-label-sm text-label-sm rounded-DEFAULT hover:bg-surface-tint transition-colors flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
            type="submit"
            form="add-movie-form"
            disabled={isSubmitting}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSubmitting ? "hourglass_empty" : "save"}
            </span>
            {isSubmitting ? "Salvando..." : "Salvar Filme"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg border border-error/50 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md">{errorMsg}</p>
        </div>
      )}

      {/* Form Layout (Bento Grid Style) */}
      <form id="add-movie-form" onSubmit={handleSubmit} className="grid grid-cols-12 gap-gutter">
        {/* Left Column (Metadata) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

          {/* Basic Info Card */}
          <div className="bg-surface-container-low border border-outline/20 rounded-lg p-6">
            <h3 className="font-headline-md text-headline-md text-on-background mb-6 pb-4 border-b border-outline/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">info</span>
              Informações Principais
            </h3>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="title">
                  Título da Obra *
                </label>
                <input
                  className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-lg text-body-lg text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-surface-variant"
                  id="title"
                  placeholder="Ex: Casablanca"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="synopsis">
                  Sinopse
                </label>
                <textarea
                  className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-none placeholder:text-surface-variant"
                  id="synopsis"
                  placeholder="Descreva a trama principal do filme..."
                  rows={5}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Technical Details Card */}
          <div className="bg-surface-container-low border border-outline/20 rounded-lg p-6">
            <h3 className="font-headline-md text-headline-md text-on-background mb-6 pb-4 border-b border-outline/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">settings_cinematic_blur</span>
              Ficha Técnica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="duration">
                  Duração (Min)
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all pr-10"
                    id="duration"
                    placeholder="120"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                    schedule
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="isPopular">
                  É Popular?
                </label>
                <div className="flex items-center justify-center h-full">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isPopular"
                      className="sr-only peer"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="genre">
                  Gênero Principal
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all appearance-none cursor-pointer"
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    <option className="text-surface-variant" disabled value="">Selecione...</option>
                    <option value="Ação">Ação</option>
                    <option value="Aventura">Aventura</option>
                    <option value="Comédia">Comédia</option>
                    <option value="Drama">Drama</option>
                    <option value="Ficção Científica">Ficção Científica</option>
                    <option value="Terror">Terror</option>
                    <option value="Romance">Romance</option>
                    <option value="Animação">Animação</option>
                    <option value="Documentário">Documentário</option>
                    <option value="Suspense">Suspense</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    arrow_drop_down
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="director">
                  Diretor
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all pr-10"
                    id="director"
                    placeholder="Ex: Christopher Nolan"
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                    person
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="cast">
                  Elenco
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all pr-10"
                    id="cast"
                    placeholder="Ex: Cillian Murphy, Emily Blunt, Matt Damon"
                    type="text"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                    groups
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Video URL Card */}
          <div className="bg-surface-container-low border border-outline/20 rounded-lg p-6">
            <h3 className="font-headline-md text-headline-md text-on-background mb-6 pb-4 border-b border-outline/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">movie</span>
              Arquivo do Filme
            </h3>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="url_movie">
                URL do Vídeo (.mp4, .mkv, etc) *
              </label>
              <div className="relative">
                <input
                  className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all pl-10"
                  id="url_movie"
                  placeholder="https://exemplo.com/video.mp4"
                  type="url"
                  value={movieUrl}
                  onChange={(e) => setMovieUrl(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  link
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Media Poster Preview) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-low border border-outline/20 rounded-lg p-6 h-full flex flex-col">
            <h3 className="font-headline-md text-headline-md text-on-background mb-6 pb-4 border-b border-outline/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">image</span>
              Pôster Oficial
            </h3>

            <div className="flex flex-col gap-5 flex-1">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase" htmlFor="url_poster">
                  URL da Imagem
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface border border-outline/30 rounded-DEFAULT px-4 py-2.5 font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all pl-10"
                    id="url_poster"
                    placeholder="https://exemplo.com/poster.jpg"
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                    link
                  </span>
                </div>
              </div>

              {/* Image Preview Box */}
              <div className="mt-2 flex-1 w-full flex items-center justify-center min-h-[300px]">
                {posterUrl ? (
                  <div className="w-full aspect-[2/3] border border-outline/30 rounded-lg overflow-hidden relative group">
                    <img
                      src={posterUrl}
                      alt="Preview do pôster"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        setPosterUrl('');
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <span className="font-label-sm text-white text-center px-4">Pôster Carregado</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[2/3] border-2 border-dashed border-outline/40 rounded-lg bg-surface flex flex-col items-center justify-center p-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">broken_image</span>
                    <span className="font-body-md text-[13px]">Nenhuma imagem renderizada</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="mt-auto pt-6">
              <div className="p-4 bg-surface rounded-lg border border-outline/10 flex gap-3">
                <span className="material-symbols-outlined text-primary-container text-[20px]">lightbulb</span>
                <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed">
                  Insira o link e veja o preview acima imediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          title={title}
          isEditing={isEditing}
          onAddAnother={handleAddAnother}
          onGoToCatalog={() => {
            setShowSuccessModal(false);
            onCancel();
          }}
        />
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirmModal && (
        <ConfirmEditModal
          title={title}
          isSubmitting={isSubmitting}
          onConfirm={executeSave}
          onCancel={() => setShowEditConfirmModal(false)}
        />
      )}
    </main>
  );
}
