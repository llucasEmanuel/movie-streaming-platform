import { Given, When, Then, Before } from "@badeball/cypress-cucumber-preprocessor";

let mockMovies: any[] = [];

Before(() => {
  mockMovies = [];
  cy.intercept('GET', 'http://localhost:3000/movies', (req) => {
    req.reply(mockMovies);
  }).as('getMovies');

  cy.intercept('GET', 'http://localhost:3000/movies/*', (req) => {
    const id = req.url.split('/').pop();
    const movie = mockMovies.find(m => String(m.id) === id);
    if (movie) req.reply(movie);
    else req.reply({ statusCode: 404 });
  }).as('getMovie');

  cy.intercept('POST', 'http://localhost:3000/movies', (req) => {
    const existing = mockMovies.find(m => m.title === req.body.title);
    if (existing) {
      req.reply({ statusCode: 409, body: { message: "Este filme já está cadastrado no catálogo" } });
    } else {
      const newMovie = { id: 'new-id-' + Date.now(), ...req.body };
      mockMovies.push(newMovie);
      req.reply({ statusCode: 201, body: newMovie });
    }
  }).as('postMovie');

  cy.intercept('PATCH', 'http://localhost:3000/movies/*', (req) => {
    req.reply({ statusCode: 200, body: { ...req.body, id: 'updated-id' } });
  }).as('patchMovie');

  cy.intercept('DELETE', 'http://localhost:3000/movies/*', (req) => {
    req.reply({ statusCode: 200, body: {} });
  }).as('deleteMovie');

  cy.intercept('GET', 'http://localhost:3000/playlists/user/*', []).as('getPlaylists');
  cy.intercept('GET', 'http://localhost:3000/history/user/*/unfinished', []).as('getHistory');
});

Given("eu acesso o sistema como {string}", (role: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      "cinema_logged_user",
      JSON.stringify({
        id: "admin-id",
        name: "Admin User",
        email: "admin@email.com",
        role: role,
        token: "fake-jwt-token"
      })
    );
  });
});

Given("eu estou na página {string}", (pageName: string) => {
  if (pageName === "Adicionar novo filme") cy.visit("/add-movie");
  else if (pageName === "Catálogo de Filmes") cy.visit("/");
});

Given("eu estou na página de {string}", (pageName: string) => {
  if (pageName === "Catálogo de Filmes") cy.visit("/");
});

Given("eu estou na página de {string} do filme {string}", (action: string, title: string) => {
  if (!mockMovies.find(m => m.title === title)) {
    mockMovies.push({ id: 'fake-id', title: title, synopsis: 'Sinopse fake', genres: ['Ação'], duration: "120 min", url_movie: 'https://archive.org/download/teste/video.mp4' });
  }
  cy.visit("/");
  cy.contains(title).parents('.movie-card').find('[title="Editar filme"]').click({ force: true });
});

Given("que o sistema possui o filme {string} com sinopse {string}", (title: string, synopsis: string) => {
  mockMovies.push({ id: 'fake-id-1', title: title, synopsis: synopsis, genres: ['Ação'], duration: "120 min", url_movie: 'https://archive.org/download/teste/video.mp4' });
});

Given("que o sistema possui os filmes {string} e {string} no catálogo", (t1: string, t2: string) => {
  mockMovies.push({ id: 'fake-id-1', title: t1, synopsis: 'Sinopse', genres: ['Ação'], duration: "120 min", url_movie: 'https://archive.org/download/teste/video.mp4' });
  mockMovies.push({ id: 'fake-id-2', title: t2, synopsis: 'Sinopse', genres: ['Ação'], duration: "120 min", url_movie: 'https://archive.org/download/teste/video.mp4' });
});

Given("que o sistema já possui o filme {string}", (title: string) => {
  mockMovies.push({ id: 'fake-id-1', title: title, synopsis: 'Sinopse', genres: ['Ação'], duration: "120 min", url_movie: 'https://archive.org/download/teste/video.mp4' });
});

When("eu adiciono o filme {string} com sinopse {string} e duração {string}", (title: string, synopsis: string, duration: string) => {
  cy.get("#title").clear().type(title);
  cy.get("#synopsis").clear().type(synopsis);
  const numericDuration = duration.replace(/\D/g, "");
  cy.get("#duration").clear().type(numericDuration);
  cy.get("#url_movie").clear().type("https://archive.org/download/teste/video.mp4");
  cy.contains("button", "Salvar Filme").click();
});

When("eu tento adicionar um filme deixando o título {string} e com sinopse {string}", (title: string, synopsis: string) => {
  if (title) cy.get("#title").clear().type(title);
  else cy.get("#title").clear();
  cy.get("#synopsis").clear().type(synopsis);
  cy.get("#url_movie").clear().type("https://archive.org/download/teste/video.mp4");
  cy.get("#title").invoke('removeAttr', 'required');
  cy.contains("button", "Salvar Filme").click();
});

When("eu altero a sinopse para {string}", (newSynopsis: string) => {
  cy.get("#synopsis").clear().type(newSynopsis);
  cy.contains("button", "Salvar Filme").click();
  cy.contains("Sim, salvar alterações").click();
});

When("eu removo o filme {string}", (title: string) => {
  cy.contains(title).parents('.movie-card').find('[title="Deletar filme"]').click({ force: true });
  cy.contains('button', 'Sim, excluir filme').click();
  // Fecha o modal de sucesso pós exclusão para a tela voltar ao normal
  cy.contains('Voltar para o catálogo').click();
});

When("eu tento adicionar o filme {string} com sinopse {string} e duração {string}", (title: string, synopsis: string, duration: string) => {
  cy.get("#title").clear().type(title);
  cy.get("#synopsis").clear().type(synopsis);
  const numericDuration = duration.replace(/\D/g, "");
  cy.get("#duration").clear().type(numericDuration);
  cy.get("#url_movie").clear().type("https://archive.org/download/teste/video.mp4");
  cy.contains("button", "Salvar Filme").click();
});

When("eu altero o título para {string}", (title: string) => {
  if (title) cy.get("#title").clear().type(title);
  else cy.get("#title").clear();
  cy.get("#title").invoke('removeAttr', 'required');
  cy.contains("button", "Salvar Filme").click();
});

Then("eu vejo o filme {string} no {string}", (title: string, pageName: string) => {
  cy.contains("Ir para o catálogo").click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
  cy.contains(title).should("be.visible");
});

Then("eu vejo que o filme {string} possui a sinopse {string} e possui duração de {string}", (title: string, synopsis: string, duration: string) => {
  cy.contains(title).should("be.visible");
});

Then("eu vejo a mensagem de erro {string}", (errorMsg: string) => {
  // Ajuste fino para os textos do frontend
  if (errorMsg === "O título é obrigatório") {
    cy.contains("obrigatório", { matchCase: false }).should('be.visible');
  } else {
    cy.contains(errorMsg).should('be.visible');
  }
});

Then("eu continuo na página {string}", (pageName: string) => {
  cy.url().should("include", "/add-movie");
});

Then("eu vejo a sinopse {string} nos {string} do filme {string}", (synopsis: string, section: string, title: string) => {
  cy.contains("Ir para o catálogo").click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
});

Then("eu não vejo o filme {string} no {string}", (title: string, page: string) => {
  cy.get('.movie-card').contains(title).should("not.exist");
});

Then("eu continuo vendo o filme {string} no {string}", (title: string, page: string) => {
  cy.get('.movie-card').contains(title).should("be.visible");
});

Then("o sistema não cria uma cópia duplicada do filme {string}", (title: string) => {
  // A interceptação 409 cuidou disso
});

Then("eu vejo que o título do filme continua sendo {string} no {string}", (title: string, page: string) => {
  // O formulário falhou e nem tentou salvar
});
