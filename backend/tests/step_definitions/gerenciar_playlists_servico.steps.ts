import { After, AfterAll, Before, Given, Then, When } from "@cucumber/cucumber";
import { strict as assert } from "assert";

import { prisma } from "../../src/database/prisma";

import {
  addMovieToPlaylistService,
  createPlaylistService,
  deletePlaylistService,
  getPlaylistsByUserIdService,
  removeMovieFromPlaylistService,
  updatePlaylistService,
} from "../../src/services/playlist-service";

import type { PlaylistModel } from "../../src/models/playlist-model";

let currentUserId = "";
let result: PlaylistModel[] | PlaylistModel | null = null;
let caughtError: Error | null = null;
let requestedPlaylistName = "";

const getUserId = (usuario: string): string => {
  return usuario;
};

const findPlaylist = async (usuario: string, playlistName: string) => {
  return await prisma.playlist.findFirst({
    where: {
      userId: getUserId(usuario),
      name: playlistName,
    },
  });
};

const createPlaylistDirectly = async (
  usuario: string,
  playlistName: string,
) => {
  return await prisma.playlist.create({
    data: {
      name: playlistName,
      userId: getUserId(usuario),
    },
  });
};

Before(() => {
  currentUserId = "";
  result = null;
  caughtError = null;
  requestedPlaylistName = "";
});

After(async () => {
  if (currentUserId) {
    await prisma.playlist.deleteMany({
      where: {
        userId: currentUserId,
      },
    });
  }
});

AfterAll(async () => {
  await prisma.$disconnect();
});

Given("existe o usuário {string} autenticado", async function (usuario: string) {
  currentUserId = getUserId(usuario);

  await prisma.playlist.deleteMany({
    where: {
      userId: currentUserId,
    },
  });
});

Given(
  "o usuário {string} possui as playlists {string} e {string}",
  async function (usuario: string, playlist1: string, playlist2: string) {
    await createPlaylistDirectly(usuario, playlist1);
    await createPlaylistDirectly(usuario, playlist2);
  },
);

Given(
  "o usuário {string} possui a playlist {string}",
  async function (usuario: string, playlistName: string) {
    await createPlaylistDirectly(usuario, playlistName);
  },
);

Given(
  "o usuário {string} não possui playlists cadastradas",
  async function (usuario: string) {
    await prisma.playlist.deleteMany({
      where: {
        userId: getUserId(usuario),
      },
    });
  },
);

Given(
  "o usuário {string} não possui a playlist {string}",
  async function (usuario: string, playlistName: string) {
    await prisma.playlist.deleteMany({
      where: {
        userId: getUserId(usuario),
        name: playlistName,
      },
    });
  },
);

Given(
  "existe o filme {string} cadastrado no sistema",
  function (movieName: string) {
    assert.ok(movieName.trim() !== "");
  },
);

Given(
  "existem os filmes {string} e {string} cadastrados no sistema",
  function (movie1: string, movie2: string) {
    assert.ok(movie1.trim() !== "");
    assert.ok(movie2.trim() !== "");
  },
);

Given(
  "a playlist {string} do usuário {string} já possui o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);

    if (!playlist.movies.includes(movieName)) {
      await addMovieToPlaylistService({
        userId: usuario,
        playlistName,
        movieName,
      });
    }
  },
);

Given(
  "a playlist {string} do usuário {string} possui o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);

    if (!playlist.movies.includes(movieName)) {
      await addMovieToPlaylistService({
        userId: usuario,
        playlistName,
        movieName,
      });
    }
  },
);

When(
  "é solicitada a listagem de playlists do usuário {string}",
  async function (usuario: string) {
    try {
      result = await getPlaylistsByUserIdService(getUserId(usuario));
      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita a criação da playlist {string}",
  async function (usuario: string, playlistName: string) {
    requestedPlaylistName = playlistName;

    try {
      result = await createPlaylistService({
        name: playlistName,
        userId: getUserId(usuario),
      });

      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita a criação de uma playlist sem informar nome",
  async function (usuario: string) {
    requestedPlaylistName = "";

    try {
      result = await createPlaylistService({
        name: "",
        userId: getUserId(usuario),
      });

      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita a remoção da playlist {string}",
  async function (usuario: string, playlistName: string) {
    requestedPlaylistName = playlistName;

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(
      playlist,
      'A playlist "' + playlistName + '" deveria existir antes da remoção',
    );

    try {
      await deletePlaylistService(playlist.id);

      result = null;
      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita alterar o nome da playlist {string} para {string}",
  async function (usuario: string, oldName: string, newName: string) {
    const playlist = await findPlaylist(usuario, oldName);

    assert.ok(
      playlist,
      'A playlist "' + oldName + '" deveria existir antes da edição',
    );

    try {
      result = await updatePlaylistService(playlist.id, {
        name: newName,
      });

      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita adicionar o filme {string} à playlist {string}",
  async function (usuario: string, movieName: string, playlistName: string) {
    try {
      result = await addMovieToPlaylistService({
        userId: usuario,
        playlistName,
        movieName,
      });

      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita remover o filme {string} da playlist {string}",
  async function (usuario: string, movieName: string, playlistName: string) {
    try {
      result = await removeMovieFromPlaylistService({
        userId: usuario,
        playlistName,
        movieName,
      });

      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

When(
  "o usuário {string} solicita as playlists disponíveis para adicionar o filme {string}",
  async function (usuario: string, _movieName: string) {
    try {
      result = await getPlaylistsByUserIdService(usuario);
      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

Then(
  "o sistema retorna as playlists {string} e {string}",
  async function (playlist1: string, playlist2: string) {
    assert.equal(caughtError, null);
    assert.ok(Array.isArray(result));

    const playlists = result as PlaylistModel[];
    const playlistNames = playlists.map((playlist) => playlist.name);

    assert.ok(playlistNames.includes(playlist1));
    assert.ok(playlistNames.includes(playlist2));
  },
);

Then("o sistema retorna uma lista vazia", function () {
  assert.equal(caughtError, null);
  assert.ok(Array.isArray(result));

  const playlists = result as PlaylistModel[];

  assert.equal(playlists.length, 0);
});

Then(
  "o sistema cadastra a playlist {string} para o usuário {string}",
  async function (playlistName: string, usuario: string) {
    assert.equal(caughtError, null);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.equal(playlist.name, playlistName);
    assert.equal(playlist.userId, getUserId(usuario));
  },
);

Then(
  "a playlist {string} passa a pertencer ao usuário {string}",
  async function (playlistName: string, usuario: string) {
    assert.equal(caughtError, null);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.equal(playlist.userId, getUserId(usuario));
  },
);

Then(
  "o sistema não cadastra uma nova playlist para o usuário {string}",
  async function (usuario: string) {
    assert.ok(caughtError);

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: getUserId(usuario),
        name: requestedPlaylistName,
      },
    });

    assert.equal(playlists.length, 1);
  },
);

Then(
  "o sistema informa que já existe uma playlist com esse nome para o usuário {string}",
  function (_usuario: string) {
    assert.ok(caughtError);
    assert.equal(caughtError.message, "Já existe uma playlist com esse nome");
  },
);

Then(
  "o sistema não cadastra a playlist para o usuário {string}",
  function (_usuario: string) {
    assert.ok(caughtError);
    assert.equal(result, null);
  },
);

Then("o sistema informa que o nome da playlist é obrigatório", function () {
  assert.ok(caughtError);
  assert.equal(caughtError.message, "O nome da playlist é obrigatório");
});

Then(
  "o sistema remove a playlist {string} do usuário {string}",
  async function (playlistName: string, usuario: string) {
    assert.equal(caughtError, null);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.equal(playlist, null);
  },
);

Then(
  "o usuário {string} continua possuindo a playlist {string}",
  async function (usuario: string, playlistName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.equal(playlist.name, playlistName);
    assert.equal(playlist.userId, getUserId(usuario));
  },
);

Then(
  "o usuário {string} não possui mais a playlist {string}",
  async function (usuario: string, playlistName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.equal(playlist, null);
  },
);

Then(
  "o sistema altera o nome da playlist para {string} para o usuário {string}",
  async function (playlistName: string, usuario: string) {
    assert.equal(caughtError, null);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.equal(playlist.name, playlistName);
    assert.equal(playlist.userId, getUserId(usuario));
  },
);

Then(
  "o sistema não altera o nome da playlist {string}",
  async function (playlistName: string) {
    assert.ok(caughtError);

    const playlist = await prisma.playlist.findFirst({
      where: {
        userId: currentUserId,
        name: playlistName,
      },
    });

    assert.ok(playlist);
    assert.equal(playlist.name, playlistName);
  },
);

Then(
  "o sistema adiciona o filme {string} à playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    assert.equal(caughtError, null);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.ok(playlist.movies.includes(movieName));
  },
);

Then(
  "o sistema não adiciona o filme {string} à playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.ok(!playlist.movies.includes(movieName));
  },
);

Then(
  "o sistema não adiciona novamente o filme {string} à playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    assert.ok(caughtError);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);

    const occurrences = playlist.movies.filter((movie) => movie === movieName);

    assert.equal(occurrences.length, 1);
  },
);

Then(
  "a playlist {string} do usuário {string} mantém apenas uma ocorrência do filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);

    const occurrences = playlist.movies.filter((movie) => movie === movieName);

    assert.equal(occurrences.length, 1);
  },
);

Then("o sistema informa que o filme já está na playlist", function () {
  assert.ok(caughtError);
  assert.equal(caughtError.message, "Filme já está na playlist");
});

Then(
  "o sistema remove o filme {string} da playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    assert.equal(caughtError, null);

    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.ok(!playlist.movies.includes(movieName));
  },
);

Then(
  "a playlist {string} do usuário {string} não possui mais o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.ok(!playlist.movies.includes(movieName));
  },
);

Then(
  "a playlist {string} do usuário {string} continua possuindo o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    assert.ok(playlist);
    assert.ok(playlist.movies.includes(movieName));
  },
);

Then("o sistema retorna uma lista vazia de playlists disponíveis", function () {
  assert.equal(caughtError, null);
  assert.ok(Array.isArray(result));

  const playlists = result as PlaylistModel[];

  assert.equal(playlists.length, 0);
});

Then(
  "o sistema não adiciona o filme {string} a nenhuma playlist do usuário {string}",
  async function (movieName: string, usuario: string) {
    const playlists = await getPlaylistsByUserIdService(usuario);

    const playlistWithMovie = playlists.find((playlist) =>
      playlist.movies.includes(movieName),
    );

    assert.equal(playlistWithMovie, undefined);
  },
);

Then("o sistema informa que não existem playlists disponíveis", function () {
  assert.equal(caughtError, null);
  assert.ok(Array.isArray(result));

  const playlists = result as PlaylistModel[];

  assert.equal(playlists.length, 0);
});

