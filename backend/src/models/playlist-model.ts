// src/models/playlist-model.ts

export interface PlaylistModel {
  id: string;
  name: string;
  userId: string;
  movies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlaylistModel {
  name: string;
  userId: string;
}

export interface UpdatePlaylistModel {
  name: string;
}

export interface AddMovieToPlaylistModel {
  userId: string;
  playlistName: string;
  movieName: string;
}

export interface RemoveMovieFromPlaylistModel {
  userId: string;
  playlistName: string;
  movieName: string;
}

