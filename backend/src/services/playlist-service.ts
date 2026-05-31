// src/services/playlist-service.ts

import {
  AddMovieToPlaylistModel,
  CreatePlaylistModel,
  PlaylistModel,
  RemoveMovieFromPlaylistModel,
  UpdatePlaylistModel,
} from "../models/playlist-model";

import {
  deletePlaylist,
  getPlaylistById,
  getPlaylistByNameAndUserId,
  getPlaylistsByUserId,
  insertPlaylist,
  updatePlaylist,
  updatePlaylistMovies,
} from "../repositories/playlist-repository";

import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";

// Camada responsável pelas regras de negócio das playlists

// Usado quando o usuário deseja criar uma nova playlist
export const createPlaylistService = async (
  playlist: CreatePlaylistModel,
): Promise<PlaylistModel> => {
  const { name, userId } = playlist;

  if (!userId || userId.trim() === "") {
    throw new BadRequestError("ID do usuário deve ser informado");
  }

  if (!name || name.trim() === "") {
    throw new BadRequestError("O nome da playlist é obrigatório");
  }

  const playlistName = name.trim();
  const user = userId.trim();

  const alreadyExists = await getPlaylistByNameAndUserId(playlistName, user);

  if (alreadyExists) {
    throw new ConflictError("Já existe uma playlist com esse nome");
  }

  const createdPlaylist = await insertPlaylist({
    name: playlistName,
    userId: user,
  });

  return createdPlaylist;
};

// Usado quando o usuário deseja visualizar todas as suas playlists
export const getPlaylistsByUserIdService = async (
  userId: string,
): Promise<PlaylistModel[]> => {
  if (!userId || userId.trim() === "") {
    throw new ValidationError("ID do usuário deve ser informado");
  }

  return await getPlaylistsByUserId(userId.trim());
};

// Usado quando o usuário deseja excluir uma playlist existente
export const deletePlaylistService = async (id: string): Promise<void> => {
  if (!id || id.trim() === "") {
    throw new ValidationError("ID da playlist deve ser informado");
  }

  const playlist = await getPlaylistById(id.trim());

  if (!playlist) {
    throw new NotFoundError("Playlist não encontrada");
  }

  await deletePlaylist(id.trim());
};

// Usado quando o usuário deseja editar o nome de uma playlist existente
export const updatePlaylistService = async (
  id: string,
  updates: UpdatePlaylistModel,
): Promise<PlaylistModel> => {
  if (!id || id.trim() === "") {
    throw new ValidationError("ID da playlist deve ser informado");
  }

  if (!updates.name || updates.name.trim() === "") {
    throw new BadRequestError("O nome da playlist é obrigatório");
  }

  const playlist = await getPlaylistById(id.trim());

  if (!playlist) {
    throw new NotFoundError("Playlist não encontrada");
  }

  const playlistName = updates.name.trim();

  const alreadyExists = await getPlaylistByNameAndUserId(
    playlistName,
    playlist.userId,
  );

  if (alreadyExists && alreadyExists.id !== id.trim()) {
    throw new ConflictError("Já existe uma playlist com esse nome");
  }

  const updatedPlaylist = await updatePlaylist(id.trim(), {
    name: playlistName,
  });

  if (!updatedPlaylist) {
    throw new NotFoundError("Não foi possível atualizar. Playlist não encontrada");
  }

  return updatedPlaylist;
};

// Usado quando o usuário deseja adicionar um filme a uma playlist
export const addMovieToPlaylistService = async (
  data: AddMovieToPlaylistModel,
): Promise<PlaylistModel> => {
  const { userId, playlistName, movieName } = data;

  if (!userId || userId.trim() === "") {
    throw new BadRequestError("ID do usuário deve ser informado");
  }

  if (!playlistName || playlistName.trim() === "") {
    throw new BadRequestError("O nome da playlist é obrigatório");
  }

  if (!movieName || movieName.trim() === "") {
    throw new BadRequestError("O nome do filme é obrigatório");
  }

  const user = userId.trim();
  const playlistTitle = playlistName.trim();
  const movieTitle = movieName.trim();

  const playlist = await getPlaylistByNameAndUserId(playlistTitle, user);

  if (!playlist) {
    throw new NotFoundError("Playlist não encontrada");
  }

  const movies = playlist.movies ?? [];

  if (movies.includes(movieTitle)) {
    throw new ConflictError("Filme já está na playlist");
  }

  const updatedPlaylist = await updatePlaylistMovies(playlist.id, [
    ...movies,
    movieTitle,
  ]);

  if (!updatedPlaylist) {
    throw new NotFoundError("Não foi possível atualizar. Playlist não encontrada");
  }

  return updatedPlaylist;
};

// Usado quando o usuário deseja remover um filme de uma playlist
export const removeMovieFromPlaylistService = async (
  data: RemoveMovieFromPlaylistModel,
): Promise<PlaylistModel> => {
  const { userId, playlistName, movieName } = data;

  if (!userId || userId.trim() === "") {
    throw new BadRequestError("ID do usuário deve ser informado");
  }

  if (!playlistName || playlistName.trim() === "") {
    throw new BadRequestError("O nome da playlist é obrigatório");
  }

  if (!movieName || movieName.trim() === "") {
    throw new BadRequestError("O nome do filme é obrigatório");
  }

  const user = userId.trim();
  const playlistTitle = playlistName.trim();
  const movieTitle = movieName.trim();

  const playlist = await getPlaylistByNameAndUserId(playlistTitle, user);

  if (!playlist) {
    throw new NotFoundError("Playlist não encontrada");
  }

  const movies = playlist.movies ?? [];

  if (!movies.includes(movieTitle)) {
    throw new NotFoundError("Filme não encontrado na playlist");
  }

  const updatedMovies = movies.filter((movie) => movie !== movieTitle);

  const updatedPlaylist = await updatePlaylistMovies(
    playlist.id,
    updatedMovies,
  );

  if (!updatedPlaylist) {
    throw new NotFoundError("Não foi possível atualizar. Playlist não encontrada");
  }

  return updatedPlaylist;
};

