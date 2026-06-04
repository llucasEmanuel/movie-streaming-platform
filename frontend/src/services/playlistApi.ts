import type { Playlist } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Erro inesperado");
  }

  return data;
}

export async function getPlaylistsByUserId(userId: string): Promise<{
  message: string;
  playlists: Playlist[];
}> {
  const response = await fetch(`${API_URL}/users/${userId}/playlists`);

  return parseResponse(response);
}

export async function createPlaylist(data: {
  name: string;
  userId: string;
}): Promise<{
  message: string;
  playlist: Playlist;
}> {
  const response = await fetch(`${API_URL}/playlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}

export async function updatePlaylist(
  id: string,
  data: { name: string },
): Promise<{
  message: string;
  playlist: Playlist;
}> {
  const response = await fetch(`${API_URL}/playlists/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}

export async function deletePlaylist(id: string): Promise<{
  message: string;
}> {
  const response = await fetch(`${API_URL}/playlists/${id}`, {
    method: "DELETE",
  });

  return parseResponse(response);
}

export async function addMovieToPlaylist(data: {
  userId: string;
  playlistName: string;
  movieName: string;
}): Promise<{
  message: string;
  playlist: Playlist;
}> {
  const response = await fetch(`${API_URL}/playlists/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}

export async function removeMovieFromPlaylist(data: {
  userId: string;
  playlistName: string;
  movieName: string;
}): Promise<{
  message: string;
  playlist: Playlist;
}> {
  const response = await fetch(`${API_URL}/playlists/movies`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}