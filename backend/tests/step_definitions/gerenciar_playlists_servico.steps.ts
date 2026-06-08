import { After, AfterAll, Before, Given, Then, When } from "@cucumber/cucumber";

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
let result: PlaylistModel[] | PlaylistModel | string[] | null = null;
let caughtError: Error | null = null;
let requestedPlaylistName = "";

const expectTrue = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const expectEqual = (actual: unknown, expected: unknown, message: string): void => {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado: ${expected}. Recebido: ${actual}`);
  }
};

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

type PlaylistDatabaseRecord = NonNullable<
  Awaited<ReturnType<typeof findPlaylist>>
>;

const requirePlaylist = (
  playlist: PlaylistDatabaseRecord | null,
  message: string,
): PlaylistDatabaseRecord => {
  if (!playlist) {
    throw new Error(message);
  }

  return playlist;
};

const requireCaughtError = (): Error => {
  if (!caughtError) {
    throw new Error("Era esperado que uma exceção tivesse sido lançada");
  }

  return caughtError;
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
    expectTrue(movieName.trim() !== "", "O nome do filme não pode ser vazio");
  },
);

Given(
  "existem os filmes {string} e {string} cadastrados no sistema",
  function (movie1: string, movie2: string) {
    expectTrue(movie1.trim() !== "", "O nome do primeiro filme não pode ser vazio");
    expectTrue(movie2.trim() !== "", "O nome do segundo filme não pode ser vazio");
  },
);

Given(
  "a playlist {string} do usuário {string} já possui o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    if (!existingPlaylist.movies.includes(movieName)) {
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

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    if (!existingPlaylist.movies.includes(movieName)) {
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

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir antes da remoção`,
    );

    try {
      await deletePlaylistService(existingPlaylist.id);

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

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${oldName}" deveria existir antes da edição`,
    );

    try {
      result = await updatePlaylistService(existingPlaylist.id, {
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
      result = await getPlaylistsByUserIdService(getUserId(usuario));
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
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");
    expectTrue(Array.isArray(result), "O resultado deveria ser uma lista");

    const playlists = result as PlaylistModel[];
    const playlistNames = playlists.map((playlist) => playlist.name);

    expectTrue(
      playlistNames.includes(playlist1),
      `A playlist "${playlist1}" deveria estar na lista`,
    );
    expectTrue(
      playlistNames.includes(playlist2),
      `A playlist "${playlist2}" deveria estar na lista`,
    );
  },
);

Then("o sistema retorna uma lista vazia", function () {
  expectEqual(caughtError, null, "Não deveria ter ocorrido erro");
  expectTrue(Array.isArray(result), "O resultado deveria ser uma lista");

  const playlists = result as PlaylistModel[];

  expectEqual(playlists.length, 0, "A lista deveria estar vazia");
});

Then(
  "o sistema cadastra a playlist {string} para o usuário {string}",
  async function (playlistName: string, usuario: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectEqual(existingPlaylist.name, playlistName, "O nome da playlist deveria ser igual");
    expectEqual(existingPlaylist.userId, getUserId(usuario), "O usuário dono da playlist deveria ser igual");
  },
);

Then(
  "a playlist {string} passa a pertencer ao usuário {string}",
  async function (playlistName: string, usuario: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectEqual(existingPlaylist.userId, getUserId(usuario), "A playlist deveria pertencer ao usuário");
  },
);

Then(
  "o sistema não cadastra uma nova playlist para o usuário {string}",
  async function (usuario: string) {
    requireCaughtError();

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: getUserId(usuario),
        name: requestedPlaylistName,
      },
    });

    expectEqual(playlists.length, 1, "Deveria existir apenas uma playlist com esse nome");
  },
);

Then(
  "o sistema informa que já existe uma playlist com esse nome para o usuário {string}",
  function (_usuario: string) {
    const error = requireCaughtError();

    expectEqual(error.message, "Já existe uma playlist com esse nome", "A mensagem de erro deveria ser a esperada");
  },
);

Then(
  "o sistema não cadastra a playlist para o usuário {string}",
  function (_usuario: string) {
    requireCaughtError();

    expectEqual(result, null, "O resultado deveria ser nulo");
  },
);

Then("o sistema informa que o nome da playlist é obrigatório", function () {
  const error = requireCaughtError();

  expectEqual(error.message, "O nome da playlist é obrigatório", "A mensagem de erro deveria ser a esperada");
});

Then(
  "o sistema remove a playlist {string} do usuário {string}",
  async function (playlistName: string, usuario: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");

    const playlist = await findPlaylist(usuario, playlistName);

    expectEqual(playlist, null, "A playlist deveria ter sido removida");
  },
);

Then(
  "o usuário {string} continua possuindo a playlist {string}",
  async function (usuario: string, playlistName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectEqual(existingPlaylist.name, playlistName, "O nome da playlist deveria continuar igual");
    expectEqual(existingPlaylist.userId, getUserId(usuario), "O usuário dono da playlist deveria continuar igual");
  },
);

Then(
  "o usuário {string} não possui mais a playlist {string}",
  async function (usuario: string, playlistName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    expectEqual(playlist, null, "A playlist deveria ter sido removida");
  },
);

Then(
  "o sistema altera o nome da playlist para {string} para o usuário {string}",
  async function (playlistName: string, usuario: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectEqual(existingPlaylist.name, playlistName, "O nome da playlist deveria ter sido atualizado");
    expectEqual(existingPlaylist.userId, getUserId(usuario), "O usuário dono da playlist deveria continuar igual");
  },
);

Then(
  "o sistema não altera o nome da playlist {string}",
  async function (playlistName: string) {
    requireCaughtError();

    const playlist = await prisma.playlist.findFirst({
      where: {
        userId: currentUserId,
        name: playlistName,
      },
    });

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria continuar existindo`,
    );

    expectEqual(existingPlaylist.name, playlistName, "O nome da playlist deveria permanecer igual");
  },
);

Then(
  "o sistema adiciona o filme {string} à playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectTrue(
      existingPlaylist.movies.includes(movieName),
      `O filme "${movieName}" deveria estar na playlist`,
    );
  },
);

Then(
  "o sistema não adiciona o filme {string} à playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectTrue(
      !existingPlaylist.movies.includes(movieName),
      `O filme "${movieName}" não deveria estar na playlist`,
    );
  },
);

Then(
  "o sistema não adiciona novamente o filme {string} à playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    requireCaughtError();

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    const occurrences = existingPlaylist.movies.filter(
      (movie) => movie === movieName,
    );

    expectEqual(occurrences.length, 1, "O filme deveria aparecer apenas uma vez");
  },
);

Then(
  "a playlist {string} do usuário {string} mantém apenas uma ocorrência do filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    const occurrences = existingPlaylist.movies.filter(
      (movie) => movie === movieName,
    );

    expectEqual(occurrences.length, 1, "O filme deveria aparecer apenas uma vez");
  },
);

Then("o sistema informa que o filme já está na playlist", function () {
  const error = requireCaughtError();

  expectEqual(error.message, "Filme já está na playlist", "A mensagem de erro deveria ser a esperada");
});

Then(
  "o sistema remove o filme {string} da playlist {string} do usuário {string}",
  async function (movieName: string, playlistName: string, usuario: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectTrue(
      !existingPlaylist.movies.includes(movieName),
      `O filme "${movieName}" deveria ter sido removido`,
    );
  },
);

Then(
  "a playlist {string} do usuário {string} não possui mais o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectTrue(
      !existingPlaylist.movies.includes(movieName),
      `O filme "${movieName}" não deveria estar mais na playlist`,
    );
  },
);

Then(
  "a playlist {string} do usuário {string} continua possuindo o filme {string}",
  async function (playlistName: string, usuario: string, movieName: string) {
    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    expectTrue(
      existingPlaylist.movies.includes(movieName),
      `O filme "${movieName}" deveria continuar na playlist`,
    );
  },
);

Then("o sistema retorna uma lista vazia de playlists disponíveis", function () {
  expectEqual(caughtError, null, "Não deveria ter ocorrido erro");
  expectTrue(Array.isArray(result), "O resultado deveria ser uma lista");

  const playlists = result as PlaylistModel[];

  expectEqual(playlists.length, 0, "A lista deveria estar vazia");
});

Then(
  "o sistema não adiciona o filme {string} a nenhuma playlist do usuário {string}",
  async function (movieName: string, usuario: string) {
    const playlists = await getPlaylistsByUserIdService(getUserId(usuario));

    const playlistWithMovie = playlists.find((playlist) =>
      playlist.movies.includes(movieName),
    );

    expectEqual(playlistWithMovie, undefined, "Nenhuma playlist deveria conter o filme");
  },
);

Then("o sistema informa que não existem playlists disponíveis", function () {
  expectEqual(caughtError, null, "Não deveria ter ocorrido erro");
  expectTrue(Array.isArray(result), "O resultado deveria ser uma lista");

  const playlists = result as PlaylistModel[];

  expectEqual(playlists.length, 0, "A lista deveria estar vazia");
});

Given(
  "a playlist {string} contém os filmes {string} e {string}",
  async function (playlistName: string, movie1: string, movie2: string) {
    const usuario = currentUserId;

    const playlist = await findPlaylist(usuario, playlistName);

    requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    await addMovieToPlaylistService({
      userId: usuario,
      playlistName,
      movieName: movie1,
    });

    await addMovieToPlaylistService({
      userId: usuario,
      playlistName,
      movieName: movie2,
    });
  },
);

Given(
  "a playlist {string} não possui filmes adicionados",
  async function (playlistName: string) {
    const usuario = currentUserId;

    const playlist = await findPlaylist(usuario, playlistName);

    const existingPlaylist = requirePlaylist(
      playlist,
      `A playlist "${playlistName}" deveria existir`,
    );

    for (const movieName of existingPlaylist.movies) {
      await removeMovieFromPlaylistService({
        userId: usuario,
        playlistName,
        movieName,
      });
    }
  },
);

When(
  "o usuário {string} entra na página {string}",
  async function (_usuario: string, playlistName: string) {
    const usuario = currentUserId;

    try {
      const playlist = await findPlaylist(usuario, playlistName);

      const existingPlaylist = requirePlaylist(
        playlist,
        `A playlist "${playlistName}" deveria existir`,
      );

      result = existingPlaylist.movies;
      caughtError = null;
    } catch (error) {
      result = null;
      caughtError = error as Error;
    }
  },
);

Then(
  "o sistema exibe os filmes {string} e {string}",
  function (movie1: string, movie2: string) {
    expectEqual(caughtError, null, "Não deveria ter ocorrido erro");
    expectTrue(Array.isArray(result), "O resultado deveria ser uma lista");

    const movies = result as string[];

    expectTrue(
      movies.includes(movie1),
      `O filme "${movie1}" deveria ser exibido`,
    );

    expectTrue(
      movies.includes(movie2),
      `O filme "${movie2}" deveria ser exibido`,
    );
  },
);