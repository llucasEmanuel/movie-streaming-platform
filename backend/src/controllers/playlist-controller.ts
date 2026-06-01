// src/controllers/playlist-controller.ts

import { Request, Response } from "express";

import {
  AddMovieToPlaylistModel,
  CreatePlaylistModel,
  RemoveMovieFromPlaylistModel,
  UpdatePlaylistModel,
} from "../models/playlist-model";

import {
  addMovieToPlaylistService,
  createPlaylistService,
  deletePlaylistService,
  getPlaylistsByUserIdService,
  removeMovieFromPlaylistService,
  updatePlaylistService,
} from "../services/playlist-service";

import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../errors/errors";

// Camada responsável por receber as requisições HTTP e devolver respostas HTTP

// Usado quando o usuário deseja criar uma nova playlist
export const postPlaylist = async (req: Request, res: Response) => {
  try {
    const playlist: CreatePlaylistModel = req.body;

    const newPlaylist = await createPlaylistService(playlist);

    return res.status(201).json({
      message: "Playlist criada com sucesso",
      playlist: newPlaylist,
    });
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ConflictError) {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro inesperado" });
  }
};

// Usado quando o usuário deseja visualizar todas as suas playlists
export const getPlaylists = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);

    const playlists = await getPlaylistsByUserIdService(userId);

    if (playlists.length === 0) {
      return res.status(200).json({
        message: "Ainda não existem playlists criadas",
        playlists,
      });
    }

    return res.status(200).json({
      message: "Playlists encontradas com sucesso",
      playlists,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro inesperado" });
  }
};

// Usado quando o usuário deseja excluir uma playlist existente
export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    await deletePlaylistService(id);

    return res.status(200).json({
      message: "Playlist removida com sucesso",
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro inesperado" });
  }
};

// Usado quando o usuário deseja editar o nome de uma playlist existente
export const patchPlaylist = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const updates: UpdatePlaylistModel = req.body;

    const updatedPlaylist = await updatePlaylistService(id, updates);

    return res.status(200).json({
      message: "Playlist atualizada com sucesso",
      playlist: updatedPlaylist,
    });
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ConflictError) {
      return res.status(409).json({ message: error.message });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro inesperado" });
  }
};

// Usado quando o usuário deseja adicionar um filme a uma playlist
export const postMovieToPlaylist = async (req: Request, res: Response) => {
  try {
    const data: AddMovieToPlaylistModel = req.body;

    const updatedPlaylist = await addMovieToPlaylistService(data);

    return res.status(200).json({
      message: "Filme adicionado à playlist com sucesso",
      playlist: updatedPlaylist,
    });
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof ConflictError) {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro inesperado" });
  }
};

// Usado quando o usuário deseja remover um filme de uma playlist
export const deleteMovieFromPlaylist = async (req: Request, res: Response) => {
  try {
    const data: RemoveMovieFromPlaylistModel = req.body;

    const updatedPlaylist = await removeMovieFromPlaylistService(data);

    return res.status(200).json({
      message: "Filme removido da playlist com sucesso",
      playlist: updatedPlaylist,
    });
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro inesperado" });
  }
};

