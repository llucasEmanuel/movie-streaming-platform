import { Before, Given, Then, When } from "@cucumber/cucumber";

interface MovieHistoryRecord {
  id: string;
  userId: string;
  movieId: string;
  title: string;
  watchedAt: string;
  watched_at: string;
  progressPercentage: number;
  is_hidden: boolean;
}

interface HistoryViewRow {
  id: string;
  movieId: string;
  title: string;
  date: string;
  progress: string;
}

interface HistoryGuiState {
  userId: string | null;
  records: MovieHistoryRecord[];
  visibleRows: HistoryViewRow[];
  pageMessage: string | null;
  currentPage: string | null;
}

function createInitialState(): HistoryGuiState {
  return {
    userId: null,
    records: [],
    visibleRows: [],
    pageMessage: null,
    currentPage: null,
  };
}

function formatDateForDisplay(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateForStorage(dateString: string): string {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}

function normalizeProgress(progressText: string): number {
  const numericValue = Number.parseInt(progressText.replace("%", ""), 10);
  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function createMovieId(title: string): string {
  return `movie-${title.toLowerCase().replace(/\s+/g, "-")}`;
}

function createHistoryRecord(title: string, date: string, progressText = "0%"): MovieHistoryRecord {
  const isoDate = `${formatDateForStorage(date)}T12:00:00.000Z`;
  return {
    id: `hist-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: USER_ID,
    movieId: createMovieId(title),
    title,
    watchedAt: isoDate,
    watched_at: formatDateForStorage(date),
    progressPercentage: normalizeProgress(progressText),
    is_hidden: false,
  };
}

function renderHistoryPage() {
  state.currentPage = "Meu Histórico";

  const visibleRecords = state.records
    .filter((record) => !record.is_hidden)
    .sort(
      (left, right) =>
        new Date(right.watchedAt).getTime() - new Date(left.watchedAt).getTime(),
    );

  state.visibleRows = visibleRecords.map((record) => ({
    id: record.id,
    movieId: record.movieId,
    title: record.title,
    date: formatDateForDisplay(record.watched_at),
    progress: `${record.progressPercentage}%`,
  }));

  if (state.visibleRows.length === 0) {
    state.pageMessage = "Nenhum filme assistido recentemente.";
    return;
  }

  state.pageMessage = null;
}

let state = createInitialState();
const USER_ID = "user-123";

Before(() => {
  state = createInitialState();
});

Given("que o usuário está logado", () => {
  state.userId = USER_ID;
  state.records = [];
  state.visibleRows = [];
  state.pageMessage = null;
  state.currentPage = null;
});

Given('assistiu ao filme {string} no dia {string}', (title: string, date: string) => {
  state.records.push(createHistoryRecord(title, date));
});

Given('o progresso assistido do filme {string} é {string}', (title: string, progressStr: string) => {
  const record = [...state.records]
    .reverse()
    .find((entry) => entry.title === title && !entry.is_hidden);

  if (record) {
    record.progressPercentage = normalizeProgress(progressStr);
    return;
  }

  // Se o cenário configurar progresso antes de criar o filme, mantemos um registro pendente.
  state.records.push({
    id: `hist-pending-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId: USER_ID,
    movieId: createMovieId(title),
    title,
    watchedAt: `${formatDateForStorage("01/01/1970")}T12:00:00.000Z`,
    watched_at: formatDateForStorage("01/01/1970"),
    progressPercentage: normalizeProgress(progressStr),
    is_hidden: false,
  });
});

Given('já possui os filmes {string} e {string} no seu histórico de filmes assistidos', (filme1: string, filme2: string) => {
  state.records.push(createHistoryRecord(filme1, "20/04/2026"));
  state.records.push(createHistoryRecord(filme2, "25/04/2026"));
});

Given('tem os filmes {string} e {string} no seu histórico de filmes assistidos', (filme1: string, filme2: string) => {
  state.records.push(createHistoryRecord(filme1, "20/04/2026"));
  state.records.push(createHistoryRecord(filme2, "25/04/2026"));
});

Given('não possui nenhum filme no histórico de filmes assistidos', () => {
  state.records = [];
});

When('o usuário assiste ao filme {string} no dia {string}', (title: string, date: string) => {
  state.records.push(createHistoryRecord(title, date, "100%"));
});

When('o usuário acessa a página {string}', (pageName: string) => {
  if (pageName !== "Meu Histórico") {
    throw new Error(`Página não reconhecida no teste: ${pageName}`);
  }

  renderHistoryPage();
});

When('acessa a página {string}', (pageName: string) => {
  if (pageName !== "Meu Histórico") {
    throw new Error(`Página não reconhecida no teste: ${pageName}`);
  }

  renderHistoryPage();
});

When('o usuário solicita esconder o filme {string} do seu histórico', (title: string) => {
  const record = state.records.find((entry) => entry.title === title && !entry.is_hidden);

  if (!record) {
    state.pageMessage = "Erro ao ocultar item do histórico";
    return;
  }

  record.is_hidden = true;
  renderHistoryPage();
  state.pageMessage = "Filme removido do histórico.";
});

When('o usuário solicita esconder todos os filmes do histórico', () => {
  const visibleRecords = state.records.filter((record) => !record.is_hidden);

  if (visibleRecords.length === 0) {
    state.pageMessage = "Seu histórico já está vazio.";
    return;
  }

  state.records = state.records.map((record) => ({
    ...record,
    is_hidden: true,
  }));

  renderHistoryPage();
  state.pageMessage = "Histórico ocultado com sucesso.";
});

Then('o usuário vê os títulos {string} e {string} do mais recente para o mais antigo', (title1: string, title2: string) => {
  if (state.visibleRows.length < 2) {
    throw new Error("Esperava ao menos dois itens no histórico visível");
  }

  if (state.visibleRows[0].title !== title1 || state.visibleRows[1].title !== title2) {
    throw new Error(`Ordem incorreta. Obtido: ${state.visibleRows[0].title}, ${state.visibleRows[1].title}`);
  }
});

Then('o usuário vê os títulos {string}, {string} e {string} do mais recente para o mais antigo', (t1: string, t2: string, t3: string) => {
  if (state.visibleRows.length < 3) {
    throw new Error("Esperava ao menos três itens no histórico visível");
  }

  const actual = state.visibleRows.slice(0, 3).map((row) => row.title);
  const expected = [t1, t2, t3];

  if (actual.join(",") !== expected.join(",")) {
    throw new Error(`Ordem incorreta. Obtido: ${actual.join(", ")}`);
  }
});

Then('o usuário vê o filme {string} duas vezes no histórico', (title: string) => {
  const occurrences = state.visibleRows.filter((row) => row.title === title).length;

  if (occurrences !== 2) {
    throw new Error(`Esperava 2 ocorrências de ${title}, mas encontrei ${occurrences}`);
  }
});

Then('e deve ver a data {string} associada ao filme {string}', (date: string, title: string) => {
  const row = state.visibleRows.find((entry) => entry.title === title && entry.date === date);

  if (!row) {
    throw new Error(`Não encontrei ${title} com a data ${date}`);
  }
});

Then('deve ver a data {string} associada ao filme {string}', (date: string, title: string) => {
  const row = state.visibleRows.find((entry) => entry.title === title && entry.date === date);

  if (!row) {
    throw new Error(`Não encontrei ${title} com a data ${date}`);
  }
});

Then('deve ver a data {string} e o progresso {string} associados a um registro do filme {string}', (date: string, progress: string, title: string) => {
  const row = state.visibleRows.find((entry) => entry.title === title && entry.date === date && entry.progress === progress);

  if (!row) {
    throw new Error(`Não encontrei ${title} com data ${date} e progresso ${progress}`);
  }
});

Then('e deve ver o progresso {string} associado ao filme {string}', (progress: string, title: string) => {
  const row = state.visibleRows.find((entry) => entry.title === title && entry.progress === progress);

  if (!row) {
    throw new Error(`Não encontrei ${title} com progresso ${progress}`);
  }
});

Then('deve ver o progresso {string} associado ao filme {string}', (progress: string, title: string) => {
  const row = state.visibleRows.find((entry) => entry.title === title && entry.progress === progress);

  if (!row) {
    throw new Error(`Não encontrei ${title} com progresso ${progress}`);
  }
});

Then('o usuário deve ver uma mensagem de confirmação de sucesso', () => {
  if (state.pageMessage !== "Filme removido do histórico." && state.pageMessage !== "Histórico ocultado com sucesso.") {
    throw new Error("Mensagem de sucesso não encontrada");
  }
});

Then('o filme {string} não deve mais estar visível na página {string}', (title: string, _pagina: string) => {
  const isVisible = state.visibleRows.some((row) => row.title === title);

  if (isVisible) {
    throw new Error(`O filme ${title} ainda está visível`);
  }
});

Then('o filme {string} deve permanecer listado como conteúdo assistido', (title: string) => {
  const isVisible = state.visibleRows.some((row) => row.title === title);

  if (!isVisible) {
    throw new Error(`O filme ${title} deveria continuar visível`);
  }
});

Then('nenhum filme deve estar visível na página {string}', (_pagina: string) => {
  if (state.visibleRows.length !== 0) {
    throw new Error("Esperava nenhum filme visível");
  }
});

Then('o usuário deve ver uma mensagem de erro', () => {
  if (state.pageMessage !== "Seu histórico já está vazio.") {
    throw new Error("Mensagem de erro não encontrada");
  }
});

Then('o usuário não deve ver nenhum título de filme listado', () => {
  if (state.visibleRows.length !== 0) {
    throw new Error("Esperava nenhuma linha de histórico visível");
  }
});

Then('o usuário deve ver uma mensagem informando que o histórico está vazio', () => {
  if (state.pageMessage !== "Nenhum filme assistido recentemente.") {
    throw new Error("Mensagem de histórico vazio não encontrada");
  }
});
