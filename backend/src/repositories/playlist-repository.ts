// src/repositories/playlist-repository.ts

import {
  CreatePlaylistModel,
  PlaylistModel,
  UpdatePlaylistModel,
} from "../models/playlist-model";

import { prisma } from "../database/prisma";

// Camada responsável pela interação com o banco de dados

// Usado quando o usuário deseja visualizar todas as suas playlists
export const getPlaylistsByUserId = async (
  userId: string,
): Promise<PlaylistModel[]> => {
  return await prisma.playlist.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Usado para buscar uma playlist específica por ID para excluir, editar ou modificar filmes
export const getPlaylistById = async (
  id: string,
): Promise<PlaylistModel | null> => {
  return await prisma.playlist.findUnique({
    where: {
      id,
    },
  });
};

// Usado para buscar uma playlist específica por nome e usuário
export const getPlaylistByNameAndUserId = async (
  name: string,
  userId: string,
): Promise<PlaylistModel | null> => {
  return await prisma.playlist.findFirst({
    where: {
      name,
      userId,
    },
  });
};

// Usado quando o usuário deseja criar uma nova playlist
export const insertPlaylist = async (
  playlist: CreatePlaylistModel,
): Promise<PlaylistModel> => {
  return await prisma.playlist.create({
    data: {
      name: playlist.name,
      userId: playlist.userId,
    },
  });
};

// Usado quando o usuário deseja excluir uma playlist existente
export const deletePlaylist = async (id: string): Promise<boolean> => {
  const playlist = await prisma.playlist.findUnique({
    where: {
      id,
    },
  });

  if (!playlist) {
    return false;
  }

  await prisma.playlist.delete({
    where: {
      id,
    },
  });

  return true;
};

// Usado quando o usuário deseja editar uma playlist existente
export const updatePlaylist = async (
  id: string,
  updates: UpdatePlaylistModel,
): Promise<PlaylistModel | null> => {
  const playlist = await prisma.playlist.findUnique({
    where: {
      id,
    },
  });

  if (!playlist) {
    return null;
  }

  return await prisma.playlist.update({
    where: {
      id,
    },
    data: {
      name: updates.name,
    },
  });
};

// Usado quando o usuário deseja adicionar ou remover filmes de uma playlist
export const updatePlaylistMovies = async (
  id: string,
  movies: string[],
): Promise<PlaylistModel | null> => {
  const playlist = await prisma.playlist.findUnique({
    where: {
      id,
    },
  });

  if (!playlist) {
    return null;
  }

  return await prisma.playlist.update({
    where: {
      id,
    },
    data: {
      movies,
    },
  });
};

