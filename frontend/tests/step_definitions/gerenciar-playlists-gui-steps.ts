import { Before, Given, Then, When } from "@cucumber/cucumber";

type MessageType = "success" | "error" | "info";

interface PlaylistState {
  name: string;
  movies: string[];
}

interface MessageState {
  type: MessageType;
  text: string;
}

interface TestState {
  userName: string | null;
  currentPage: string | null;
  selectedPlaylist: string | null;
  availablePages: Set<string>;
  playlists: Map<string, PlaylistState>;
  visiblePlaylists: string[];
  visiblePlaylistMovies: string[];
  catalogMovies: Set<string>;
  availablePlaylistsToAddMovie: string[];
  message: MessageState | null;
  lastActionSuccess: boolean | null;
  lastActionType: string | null;
  playlistCountBeforeAction: number;
}

function expectTrue(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado: ${expected}. Recebido: ${actual}`);
  }
}

function expectDefined<T>(
  value: T | null | undefined,
  message: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

function createInitialState(): TestState {
  return {
    userName: null,
    currentPage: null,
    selectedPlaylist: null,
    availablePages: new Set<string>(),
    playlists: new Map<string, PlaylistState>(),
    visiblePlaylists: [],
    visiblePlaylistMovies: [],
    catalogMovies: new Set<string>(),
    availablePlaylistsToAddMovie: [],
    message: null,
    lastActionSuccess: null,
    lastActionType: null,
    playlistCountBeforeAction: 0,
  };
}

let state: TestState = createInitialState();

function resetState() {
  state = createInitialState();
}

function renderMinhasPlaylistsPage() {
  state.currentPage = "Minhas Playlists";
  state.selectedPlaylist = null;
  state.visiblePlaylists = Array.from(state.playlists.keys());
  state.visiblePlaylistMovies = [];

  if (state.visiblePlaylists.length === 0) {
    state.message = {
      type: "info",
      text: "Ainda não existem playlists criadas",
    };
  }
}

function renderPlaylistDetail(playlistName: string) {
  const playlist = state.playlists.get(playlistName);

  state.currentPage = "Minhas Playlists";
  state.selectedPlaylist = playlistName;
  state.visiblePlaylists = Array.from(state.playlists.keys());
  state.visiblePlaylistMovies = playlist ? [...playlist.movies] : [];
}

function ensurePlaylistExists(playlistName: string) {
  if (!state.playlists.has(playlistName)) {
    state.playlists.set(playlistName, {
      name: playlistName,
      movies: [],
    });
  }
}

function removePlaylistIfExists(playlistName: string) {
  state.playlists.delete(playlistName);
  state.visiblePlaylists = state.visiblePlaylists.filter(
    (name) => name !== playlistName,
  );
}

function getPlaylist(playlistName: string) {
  return state.playlists.get(playlistName);
}

function countPlaylistOccurrences(playlistName: string) {
  return Array.from(state.playlists.keys()).filter(
    (name) => name === playlistName,
  ).length;
}

function countMovieOccurrences(playlistName: string, movieName: string) {
  const playlist = getPlaylist(playlistName);

  if (!playlist) {
    return 0;
  }

  return playlist.movies.filter((movie) => movie === movieName).length;
}

function createPlaylist(playlistName: string) {
  state.playlistCountBeforeAction = state.playlists.size;
  state.lastActionType = "create";

  const trimmedName = playlistName.trim();

  if (!trimmedName) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "O nome da playlist é obrigatório",
    };
    return;
  }

  if (state.playlists.has(trimmedName)) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Já existe uma playlist com esse nome",
    };
    return;
  }

  state.playlists.set(trimmedName, {
    name: trimmedName,
    movies: [],
  });

  state.lastActionSuccess = true;
  state.message = {
    type: "success",
    text: "Playlist criada com sucesso",
  };

  if (state.currentPage === "Minhas Playlists") {
    renderMinhasPlaylistsPage();
    state.message = {
      type: "success",
      text: "Playlist criada com sucesso",
    };
  }
}

function editPlaylist(oldName: string, newName: string) {
  state.lastActionType = "edit";

  const oldPlaylist = getPlaylist(oldName);

  if (!oldPlaylist) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Playlist não encontrada",
    };
    return;
  }

  if (state.playlists.has(newName)) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Já existe uma playlist com esse nome",
    };
    return;
  }

  state.playlists.delete(oldName);
  state.playlists.set(newName, {
    name: newName,
    movies: [...oldPlaylist.movies],
  });

  state.lastActionSuccess = true;
  state.message = {
    type: "success",
    text: "Playlist atualizada com sucesso",
  };

  if (state.currentPage === "Minhas Playlists") {
    renderMinhasPlaylistsPage();
    state.message = {
      type: "success",
      text: "Playlist atualizada com sucesso",
    };
  }
}

function deletePlaylist(playlistName: string) {
  state.lastActionType = "delete-playlist";

  if (!state.playlists.has(playlistName)) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Playlist não encontrada",
    };
    return;
  }

  state.playlists.delete(playlistName);

  state.lastActionSuccess = true;
  state.message = {
    type: "success",
    text: "Playlist removida com sucesso",
  };

  if (state.currentPage === "Minhas Playlists") {
    renderMinhasPlaylistsPage();
    state.message = {
      type: "success",
      text: "Playlist removida com sucesso",
    };
  }
}

function addMovieToPlaylist(movieName: string, playlistName: string) {
  state.lastActionType = "add-movie";

  const playlist = getPlaylist(playlistName);

  if (!playlist) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Playlist não encontrada",
    };
    return;
  }

  if (playlist.movies.includes(movieName)) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Filme já está na playlist",
    };
    return;
  }

  playlist.movies.push(movieName);

  state.lastActionSuccess = true;
  state.message = {
    type: "success",
    text: "Filme adicionado à playlist com sucesso",
  };
}

function removeMovieFromPlaylist(movieName: string, playlistName: string) {
  state.lastActionType = "remove-movie";

  const playlist = getPlaylist(playlistName);

  if (!playlist) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Playlist não encontrada",
    };
    return;
  }

  if (!playlist.movies.includes(movieName)) {
    state.lastActionSuccess = false;
    state.message = {
      type: "error",
      text: "Filme não encontrado na playlist",
    };
    return;
  }

  playlist.movies = playlist.movies.filter((movie) => movie !== movieName);

  state.lastActionSuccess = true;
  state.message = {
    type: "success",
    text: "Filme removido da playlist com sucesso",
  };

  if (state.selectedPlaylist === playlistName) {
    renderPlaylistDetail(playlistName);
    state.message = {
      type: "success",
      text: "Filme removido da playlist com sucesso",
    };
  }
}

Before(function () {
  resetState();
});

Given("eu acesso o sistema como {string}", function (userName: string) {
  state.userName = userName;
});

Given("a página {string} está disponível", function (pageName: string) {
  state.availablePages.add(pageName);
});

Given(
  "eu possuo as playlists {string} e {string}",
  function (playlistName1: string, playlistName2: string) {
    ensurePlaylistExists(playlistName1);
    ensurePlaylistExists(playlistName2);
  },
);

Given("eu não possuo playlists criadas", function () {
  state.playlists.clear();
  state.visiblePlaylists = [];
});

Given("eu estou na página {string}", function (pageName: string) {
  state.currentPage = pageName;

  if (pageName === "Minhas Playlists") {
    renderMinhasPlaylistsPage();
  }
});

Given("eu não possuo a playlist {string}", function (playlistName: string) {
  removePlaylistIfExists(playlistName);
});

Given("existe a opção de criar playlists", function () {
  expectEqual(
    state.currentPage,
    "Minhas Playlists",
    "A opção de criar playlists só deve existir na página Minhas Playlists",
  );
});

Given("eu possuo a playlist {string}", function (playlistName: string) {
  ensurePlaylistExists(playlistName);

  if (state.currentPage === "Minhas Playlists") {
    renderMinhasPlaylistsPage();
  }
});

Given(
  "existe a opção de remover a playlist {string}",
  function (playlistName: string) {
    expectTrue(
      state.playlists.has(playlistName),
      `A playlist "${playlistName}" deveria existir para ser removida`,
    );
  },
);

Given(
  "existe a opção de editar a playlist {string}",
  function (playlistName: string) {
    expectTrue(
      state.playlists.has(playlistName),
      `A playlist "${playlistName}" deveria existir para ser editada`,
    );
  },
);

Given("eu vejo o filme {string}", function (movieName: string) {
  state.catalogMovies.add(movieName);
});

Given(
  "o filme {string} possui a opção de ser adicionado a uma playlist",
  function (movieName: string) {
    expectTrue(
      state.catalogMovies.has(movieName),
      `O filme "${movieName}" deveria estar visível no catálogo`,
    );
  },
);

Given(
  "a playlist {string} já possui o filme {string}",
  function (playlistName: string, movieName: string) {
    ensurePlaylistExists(playlistName);

    const playlist = getPlaylist(playlistName);
    expectDefined(playlist, `A playlist "${playlistName}" deveria existir`);

    if (!playlist.movies.includes(movieName)) {
      playlist.movies.push(movieName);
    }
  },
);

Given("eu estou na playlist {string}", function (playlistName: string) {
  ensurePlaylistExists(playlistName);
  renderPlaylistDetail(playlistName);
});

Given(
  "a playlist {string} possui o filme {string}",
  function (playlistName: string, movieName: string) {
    ensurePlaylistExists(playlistName);

    const playlist = getPlaylist(playlistName);
    expectDefined(playlist, `A playlist "${playlistName}" deveria existir`);

    if (!playlist.movies.includes(movieName)) {
      playlist.movies.push(movieName);
    }

    if (state.selectedPlaylist === playlistName) {
      renderPlaylistDetail(playlistName);
    }
  },
);

Given(
  "o filme {string} possui a opção de ser removido da playlist {string}",
  function (movieName: string, playlistName: string) {
    const playlist = getPlaylist(playlistName);
    expectDefined(playlist, `A playlist "${playlistName}" deveria existir`);

    expectTrue(
      playlist.movies.includes(movieName),
      `O filme "${movieName}" deveria estar na playlist "${playlistName}"`,
    );
  },
);

When("eu acesso a página {string}", function (pageName: string) {
  expectTrue(
    state.availablePages.has(pageName) || pageName === "Minhas Playlists",
    `A página "${pageName}" deveria estar disponível`,
  );

  if (pageName === "Minhas Playlists") {
    renderMinhasPlaylistsPage();
    return;
  }

  state.currentPage = pageName;
});

When("eu tento criar a playlist {string}", function (playlistName: string) {
  createPlaylist(playlistName);
});

When("eu tento criar uma playlist sem informar nome", function () {
  createPlaylist("");
});

When("eu tento remover a playlist {string}", function (playlistName: string) {
  deletePlaylist(playlistName);
});

When(
  "eu tento mudar o nome da playlist {string} para {string}",
  function (oldName: string, newName: string) {
    editPlaylist(oldName, newName);
  },
);

When(
  "eu tento adicionar o filme {string} à playlist {string}",
  function (movieName: string, playlistName: string) {
    addMovieToPlaylist(movieName, playlistName);
  },
);

When(
  "eu tento remover o filme {string} da playlist {string}",
  function (movieName: string, playlistName: string) {
    removeMovieFromPlaylist(movieName, playlistName);
  },
);

When(
  "eu clico na opção de adicionar o filme {string} a uma playlist",
  function (movieName: string) {
    state.lastActionType = "open-add-movie-modal";

    if (state.playlists.size === 0) {
      state.availablePlaylistsToAddMovie = [];
      state.lastActionSuccess = false;
      state.message = {
        type: "info",
        text: "Não existem playlists disponíveis",
      };
      return;
    }

    state.availablePlaylistsToAddMovie = Array.from(state.playlists.keys());
    state.lastActionSuccess = true;
    state.message = null;
    state.catalogMovies.add(movieName);
  },
);

Then(
  "as playlists {string} e {string} são exibidas",
  function (playlistName1: string, playlistName2: string) {
    expectTrue(
      state.visiblePlaylists.includes(playlistName1),
      `A playlist "${playlistName1}" deveria estar visível`,
    );

    expectTrue(
      state.visiblePlaylists.includes(playlistName2),
      `A playlist "${playlistName2}" deveria estar visível`,
    );
  },
);

Then("nenhuma playlist é exibida", function () {
  expectEqual(
    state.visiblePlaylists.length,
    0,
    "Nenhuma playlist deveria estar visível",
  );
});

Then("o sistema informa que ainda não existem playlists criadas", function () {
  expectEqual(state.message?.type, "info", "A mensagem deveria ser informativa");

  const text = state.message?.text.toLowerCase() ?? "";

  expectTrue(
    text.includes("não existem playlists") ||
      text.includes("ainda não existem playlists"),
    "A mensagem deveria informar que ainda não existem playlists criadas",
  );
});

Then("o sistema cria a playlist {string}", function (playlistName: string) {
  expectEqual(state.lastActionType, "create", "A última ação deveria ser criar");
  expectEqual(state.lastActionSuccess, true, "A criação deveria ter sucesso");

  expectTrue(
    state.playlists.has(playlistName),
    `A playlist "${playlistName}" deveria ter sido criada`,
  );
});

Then(
  "a playlist {string} aparece na página {string}",
  function (playlistName: string, pageName: string) {
    expectEqual(
      pageName,
      "Minhas Playlists",
      "A verificação deveria ocorrer na página Minhas Playlists",
    );

    expectTrue(
      state.visiblePlaylists.includes(playlistName),
      `A playlist "${playlistName}" deveria aparecer na página`,
    );
  },
);

Then("o sistema exibe uma mensagem de sucesso", function () {
  expectEqual(state.message?.type, "success", "A mensagem deveria ser de sucesso");
});

Then("o sistema não cria uma nova playlist", function () {
  expectEqual(state.lastActionType, "create", "A última ação deveria ser criar");
  expectEqual(state.lastActionSuccess, false, "A criação deveria falhar");
});

Then(
  "a playlist {string} permanece aparecendo uma única vez na página {string}",
  function (playlistName: string, pageName: string) {
    expectEqual(
      pageName,
      "Minhas Playlists",
      "A verificação deveria ocorrer na página Minhas Playlists",
    );

    if (state.currentPage === "Minhas Playlists") {
      renderMinhasPlaylistsPage();
    }

    expectEqual(
      countPlaylistOccurrences(playlistName),
      1,
      `A playlist "${playlistName}" deveria existir uma única vez no estado`,
    );

    expectEqual(
      state.visiblePlaylists.filter((name) => name === playlistName).length,
      1,
      `A playlist "${playlistName}" deveria aparecer uma única vez na tela`,
    );
  },
);

Then("o sistema exibe uma mensagem de erro", function () {
  expectEqual(state.message?.type, "error", "A mensagem deveria ser de erro");
});

Then("o sistema não cria a playlist", function () {
  expectEqual(state.lastActionType, "create", "A última ação deveria ser criar");
  expectEqual(state.lastActionSuccess, false, "A criação deveria falhar");
});

Then("nenhuma nova playlist aparece na página {string}", function (pageName: string) {
  expectEqual(
    pageName,
    "Minhas Playlists",
    "A verificação deveria ocorrer na página Minhas Playlists",
  );

  expectEqual(
    state.playlists.size,
    state.playlistCountBeforeAction,
    "Nenhuma nova playlist deveria ter sido criada",
  );
});

Then("o sistema remove a playlist {string}", function (playlistName: string) {
  expectEqual(
    state.lastActionType,
    "delete-playlist",
    "A última ação deveria ser remover playlist",
  );

  expectEqual(state.lastActionSuccess, true, "A remoção deveria ter sucesso");

  expectTrue(
    !state.playlists.has(playlistName),
    `A playlist "${playlistName}" deveria ter sido removida`,
  );
});

Then(
  "a playlist {string} não aparece na página {string}",
  function (playlistName: string, pageName: string) {
    expectEqual(
      pageName,
      "Minhas Playlists",
      "A verificação deveria ocorrer na página Minhas Playlists",
    );

    if (state.currentPage === "Minhas Playlists") {
      renderMinhasPlaylistsPage();
    }

    expectTrue(
      !state.visiblePlaylists.includes(playlistName),
      `A playlist "${playlistName}" não deveria aparecer na página`,
    );
  },
);

Then(
  "a playlist {string} permanece aparecendo na página {string}",
  function (playlistName: string, pageName: string) {
    expectEqual(
      pageName,
      "Minhas Playlists",
      "A verificação deveria ocorrer na página Minhas Playlists",
    );

    if (state.currentPage === "Minhas Playlists") {
      renderMinhasPlaylistsPage();
    }

    expectTrue(
      state.visiblePlaylists.includes(playlistName),
      `A playlist "${playlistName}" deveria permanecer aparecendo`,
    );
  },
);

Then(
  "o sistema altera o nome da playlist para {string}",
  function (newPlaylistName: string) {
    expectEqual(state.lastActionType, "edit", "A última ação deveria ser editar");
    expectEqual(state.lastActionSuccess, true, "A edição deveria ter sucesso");

    expectTrue(
      state.playlists.has(newPlaylistName),
      `A playlist "${newPlaylistName}" deveria existir após a edição`,
    );
  },
);

Then(
  "o sistema não altera o nome da playlist {string}",
  function (playlistName: string) {
    expectEqual(state.lastActionType, "edit", "A última ação deveria ser editar");
    expectEqual(state.lastActionSuccess, false, "A edição deveria falhar");

    expectTrue(
      state.playlists.has(playlistName),
      `A playlist "${playlistName}" deveria continuar existindo`,
    );
  },
);

Then(
  "o sistema adiciona o filme {string} à playlist {string}",
  function (movieName: string, playlistName: string) {
    const playlist = getPlaylist(playlistName);
    expectDefined(playlist, `A playlist "${playlistName}" deveria existir`);

    expectEqual(
      state.lastActionType,
      "add-movie",
      "A última ação deveria ser adicionar filme",
    );

    expectEqual(state.lastActionSuccess, true, "A adição deveria ter sucesso");

    expectTrue(
      playlist.movies.includes(movieName),
      `O filme "${movieName}" deveria estar na playlist "${playlistName}"`,
    );
  },
);

Then(
  "o sistema não adiciona o filme {string} à playlist {string}",
  function (movieName: string, playlistName: string) {
    const playlist = getPlaylist(playlistName);
    expectDefined(playlist, `A playlist "${playlistName}" deveria existir`);

    expectTrue(
      !playlist.movies.includes(movieName),
      `O filme "${movieName}" não deveria estar na playlist "${playlistName}"`,
    );
  },
);

Then(
  "o sistema não adiciona novamente o filme {string} à playlist {string}",
  function (movieName: string, playlistName: string) {
    expectEqual(
      state.lastActionType,
      "add-movie",
      "A última ação deveria ser adicionar filme",
    );

    expectEqual(state.lastActionSuccess, false, "A adição deveria falhar");

    expectEqual(
      countMovieOccurrences(playlistName, movieName),
      1,
      `O filme "${movieName}" deveria aparecer apenas uma vez na playlist "${playlistName}"`,
    );
  },
);

Then(
  "a playlist {string} mantém apenas uma ocorrência do filme {string}",
  function (playlistName: string, movieName: string) {
    expectEqual(
      countMovieOccurrences(playlistName, movieName),
      1,
      `A playlist "${playlistName}" deveria manter apenas uma ocorrência do filme "${movieName}"`,
    );
  },
);

Then(
  "o sistema remove o filme {string} da playlist {string}",
  function (movieName: string, playlistName: string) {
    expectEqual(
      state.lastActionType,
      "remove-movie",
      "A última ação deveria ser remover filme",
    );

    expectEqual(state.lastActionSuccess, true, "A remoção deveria ter sucesso");

    expectEqual(
      countMovieOccurrences(playlistName, movieName),
      0,
      `O filme "${movieName}" deveria ter sido removido da playlist "${playlistName}"`,
    );
  },
);

Then(
  "a playlist {string} não exibe o filme {string}",
  function (playlistName: string, movieName: string) {
    if (state.selectedPlaylist === playlistName) {
      renderPlaylistDetail(playlistName);
    }

    expectTrue(
      !state.visiblePlaylistMovies.includes(movieName),
      `A playlist "${playlistName}" não deveria exibir o filme "${movieName}"`,
    );
  },
);

Then(
  "a playlist {string} continua exibindo o filme {string}",
  function (playlistName: string, movieName: string) {
    if (state.selectedPlaylist === playlistName) {
      renderPlaylistDetail(playlistName);
    }

    expectTrue(
      state.visiblePlaylistMovies.includes(movieName),
      `A playlist "${playlistName}" deveria continuar exibindo o filme "${movieName}"`,
    );
  },
);

Then("o sistema não exibe playlists disponíveis", function () {
  expectEqual(
    state.availablePlaylistsToAddMovie.length,
    0,
    "Nenhuma playlist deveria estar disponível para adicionar filme",
  );
});

Then(
  "o sistema não adiciona o filme {string} a nenhuma playlist",
  function (movieName: string) {
    const playlists = Array.from(state.playlists.values());

    expectTrue(
      playlists.every((playlist) => !playlist.movies.includes(movieName)),
      `O filme "${movieName}" não deveria ter sido adicionado a nenhuma playlist`,
    );
  },
);

Then("o sistema informa que não existem playlists disponíveis", function () {
  expectEqual(state.message?.type, "info", "A mensagem deveria ser informativa");

  const text = state.message?.text.toLowerCase() ?? "";

  expectTrue(
    text.includes("não existem playlists disponíveis"),
    "A mensagem deveria informar que não existem playlists disponíveis",
  );
});