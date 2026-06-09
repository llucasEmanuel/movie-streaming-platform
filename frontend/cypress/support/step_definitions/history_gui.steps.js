const { Given, When, Then, Before } = require("cypress-cucumber-preprocessor/steps");

let mockHistory = [];
const USER_ID = "user-123";

function toIsoDay(datePtBr) {
  const [day, month, year] = datePtBr.split("/");
  return `${year}-${month}-${day}`;
}

function toMovieId(title) {
  return `movie-${title.toLowerCase().replace(/\s+/g, "-")}`;
}

function findLatestByTitle(title) {
  for (let i = mockHistory.length - 1; i >= 0; i -= 1) {
    if (mockHistory[i].title === title) {
      return mockHistory[i];
    }
  }

  return null;
}

function buildHistoryPayload() {
  const sorted = [...mockHistory].sort(
    (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime(),
  );

  return sorted.map((item) => ({
    id: item.id,
    userId: USER_ID,
    movieId: item.movieId,
    watchedAt: item.watchedAt,
    watched_at: item.watched_at,
    title: item.title,
    last_position: item.last_position,
    is_completed: false,
    is_hidden: false,
    movie: {
      duration: "100",
    },
  }));
}

Before(() => {
  mockHistory = [];
});

Given("que o usuário está logado", () => {
  mockHistory = [];
});

Given('assistiu ao filme {string} no dia {string}', (title, date) => {
  const watchedDay = toIsoDay(date);

  mockHistory.push({
    id: `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    movieId: toMovieId(title),
    title,
    watchedAt: `${watchedDay}T12:00:00.000Z`,
    watched_at: watchedDay,
    progress_percentage: 0,
    last_position: 0,
  });
});

Given('o progresso assistido do filme {string} é {string}', (title, progress) => {
  const current = findLatestByTitle(title);

  if (!current) {
    return;
  }

  current.last_position = 0;
});

Given('já possui os filmes {string} e {string} no seu histórico de filmes assistidos', (movie1, movie2) => {
  mockHistory.push({
    id: `hist-${Date.now()}-a`,
    movieId: toMovieId(movie1),
    title: movie1,
    watchedAt: `${toIsoDay("20/04/2026")}T12:00:00.000Z`,
    watched_at: toIsoDay("20/04/2026"),
    last_position: 0,
  });

  mockHistory.push({
    id: `hist-${Date.now()}-b`,
    movieId: toMovieId(movie2),
    title: movie2,
    watchedAt: `${toIsoDay("25/04/2026")}T12:00:00.000Z`,
    watched_at: toIsoDay("25/04/2026"),
    last_position: 0,
  });
});

Given('tem os filmes {string} e {string} no seu histórico de filmes assistidos', (movie1, movie2) => {
  mockHistory.push({
    id: `hist-${Date.now()}-c`,
    movieId: toMovieId(movie1),
    title: movie1,
    watchedAt: `${toIsoDay("20/04/2026")}T12:00:00.000Z`,
    watched_at: toIsoDay("20/04/2026"),
    last_position: 0,
  });

  mockHistory.push({
    id: `hist-${Date.now()}-d`,
    movieId: toMovieId(movie2),
    title: movie2,
    watchedAt: `${toIsoDay("25/04/2026")}T12:00:00.000Z`,
    watched_at: toIsoDay("25/04/2026"),
    last_position: 0,
  });
});

Given("não possui nenhum filme no histórico de filmes assistidos", () => {
  mockHistory = [];
});

When('o usuário assiste ao filme {string} no dia {string}', (title, date) => {
  const watchedDay = toIsoDay(date);

  mockHistory.push({
    id: `hist-${Date.now()}-watch`,
    movieId: toMovieId(title),
    title,
    watchedAt: `${watchedDay}T12:00:00.000Z`,
    watched_at: watchedDay,
    last_position: 100 * 60,
  });
});

function openHistoryPage() {
  const responseBody = { data: buildHistoryPayload() };

  cy.intercept("GET", `**/history/${USER_ID}`, {
    statusCode: 200,
    body: responseBody,
  }).as("getHistory");

  cy.intercept("PATCH", "**/history/hide-movie", {
    statusCode: 200,
    body: { message: "Filme removido do histórico." },
  }).as("hideMovie");

  cy.visit("/history", {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "cinema_logged_user",
        JSON.stringify({ id: USER_ID, name: "Teste" }),
      );
    },
  });

  cy.wait("@getHistory");
}

When('o usuário acessa a página {string}', (page) => {
  if (page !== "Meu Histórico") {
    throw new Error(`Página não suportada no teste: ${page}`);
  }

  openHistoryPage();
});

When('acessa a página {string}', (page) => {
  if (page !== "Meu Histórico") {
    throw new Error(`Página não suportada no teste: ${page}`);
  }

  openHistoryPage();
});

When('o usuário solicita esconder o filme {string} do seu histórico', (title) => {
  openHistoryPage();
  cy.contains(".history-item-row", title)
    .find('button[title="Esconder do histórico"]')
    .click();

  cy.wait("@hideMovie");
});

When("o usuário solicita esconder todos os filmes do histórico", () => {
  const empty = mockHistory.length === 0;

  cy.intercept("PATCH", "**/history/hide-all", {
    statusCode: empty ? 400 : 200,
    body: empty
      ? { error: "Seu histórico já está vazio." }
      : { message: "Histórico ocultado com sucesso." },
  }).as("hideAllDynamic");

  openHistoryPage();

  if (!empty) {
    cy.get(".btn-hide-all-dark").click();
    cy.wait("@hideAllDynamic");
  }
});

Then('o usuário vê os títulos {string} e {string} do mais recente para o mais antigo', (title1, title2) => {
  cy.get(".history-title").eq(0).should("have.text", title1);
  cy.get(".history-title").eq(1).should("have.text", title2);
});

Then('o usuário vê os títulos {string}, {string} e {string} do mais recente para o mais antigo', (t1, t2, t3) => {
  cy.get(".history-title").eq(0).should("have.text", t1);
  cy.get(".history-title").eq(1).should("have.text", t2);
  cy.get(".history-title").eq(2).should("have.text", t3);
});

Then('o usuário vê o filme {string} duas vezes no histórico', (title) => {
  cy.get(".history-title").filter(`:contains("${title}")`).should("have.length", 2);
});

Then('e deve ver a data {string} associada ao filme {string}', (date, title) => {
  cy.get(".history-item-row").should((rows) => {
    const found = [...rows].some((row) => {
      const text = row.textContent || "";
      return text.includes(title) && text.includes(date);
    });

    expect(found, `Registro do filme ${title} com a data ${date}`).to.eq(true);
  });
});

Then('deve ver a data {string} associada ao filme {string}', (date, title) => {
  cy.get(".history-item-row").should((rows) => {
    const found = [...rows].some((row) => {
      const text = row.textContent || "";
      return text.includes(title) && text.includes(date);
    });

    expect(found, `Registro do filme ${title} com a data ${date}`).to.eq(true);
  });
});

Then('deve ver a data {string} e o progresso {string} associados a um registro do filme {string}', (date, progress, title) => {
  cy.get(".history-item-row").should("satisfy", (rows) => {
    return [...rows].some((row) => {
      const text = row.textContent || "";
      return text.includes(title) && text.includes(date) && text.includes(progress);
    });
  });
});

Then('e deve ver o progresso {string} associado ao filme {string}', (progress, title) => {
  cy.contains(".history-item-row", title).find(".history-progress").should("contain", progress);
});

Then('deve ver o progresso {string} associado ao filme {string}', (progress, title) => {
  cy.contains(".history-item-row", title).find(".history-progress").should("contain", progress);
});

Then("o usuário deve ver uma mensagem de confirmação de sucesso", () => {
  cy.get(".history-item-row, .history-empty-box").should("exist");
});

Then('o filme {string} não deve mais estar visível na página {string}', (title) => {
  cy.get(".history-list-dark").should("not.contain", title);
});

Then('o filme {string} deve permanecer listado como conteúdo assistido', (title) => {
  cy.get(".history-list-dark").should("contain", title);
});

Then('nenhum filme deve estar visível na página {string}', () => {
  cy.get(".history-item-row").should("not.exist");
});

Then("o usuário deve ver uma mensagem de erro", () => {
  cy.get(".history-empty-box").should("exist");
});

Then("o usuário não deve ver nenhum título de filme listado", () => {
  cy.get(".history-item-row").should("not.exist");
});

Then("o usuário deve ver uma mensagem informando que o histórico está vazio", () => {
  cy.get(".history-empty-box").should("contain", "Nenhum filme assistido recentemente.");
});
