# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/movie.spec.ts >> Teste de Feature Isolado >> Deve injetar a sessão, carregar os filmes e testar a feature
- Location: tests/movie.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.movies-grid')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for locator('.movies-grid')

```

```yaml
- banner:
  - img "Cinema"
  - navigation:
    - button "Página Principal"
    - button "Minhas Playlists"
    - button "Recomendados"
  - button "U"
- main:
  - paragraph: Catálogo
  - heading "Página Principal" [level=1]
  - paragraph: Explore o catálogo de filmes e organize seus favoritos in playlists.
  - heading "Continuar Assistindo" [level=2]
  - paragraph: Nenhum filme em andamento no momento.
  - heading "Todos os Filmes" [level=2]
  - article:
    - img "Metropolis"
    - heading "Metropolis" [level=2]
    - paragraph:
      - strong: "Duração:"
      - text: 153 min
    - paragraph:
      - strong: "Gêneros:"
      - text: Ficção Científica, Drama
    - button "Adicionar à playlist"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const FRONTEND_URL = 'http://localhost:5173'; 
  4  | const BACKEND_URL = 'http://localhost:3000';
  5  | 
  6  | test.describe('Teste de Feature Isolado', () => {
  7  | 
  8  |   test('Deve injetar a sessão, carregar os filmes e testar a feature', async ({ page, context }) => {
  9  |     
  10 |     // 1. Injeta o usuário diretamente no localStorage do navegador ANTES de acessar a URL
  11 |     // Isso faz o App.tsx entender que você já está logado
  12 |     await context.addInitScript(() => {
  13 |       const sessionUser = {
  14 |         id: 'user-uuid-de-teste-123',
  15 |         name: 'Tester Classic',
  16 |         email: 'lessl@cin.ufpe.br',
  17 |         role: 'usuario',
  18 |         token: 'jwt-falso-de-teste'
  19 |       };
  20 |       window.localStorage.setItem('cinema_logged_user', JSON.stringify(sessionUser));
  21 |     });
  22 | 
  23 |     // 2. Intercepta a chamada do movieService para retornar o filme simulado imediatamente
  24 |     await page.route(`${BACKEND_URL}/movies`, async (route) => {
  25 |       if (route.request().method() === 'GET') {
  26 |         await route.fulfill({
  27 |           status: 200,
  28 |           contentType: 'application/json',
  29 |           headers: { 'access-control-allow-origin': '*' }, // Evita bloqueios de CORS internos no Docker
  30 |           body: JSON.stringify([
  31 |             {
  32 |               id: 'a9b8c7d6-e5f4-3210-abcd-ef0123456789', // ID que será passado para a página de detalhes
  33 |               title: 'Metropolis',
  34 |               file_name: 'https://archive.org/download/metropolis-1927/video.mp4',
  35 |               img_url: 'https://lh3.googleusercontent.com/placeholder',
  36 |               synopsis: 'Uma obra-prima da ficção científica distópica clássica.',
  37 |               genres: 'Ficção Científica, Drama',
  38 |               isPopular: true,
  39 |               duration: '153',
  40 |               director: 'Fritz Lang',
  41 |               cast: 'Alfred Abel, Brigitte Helm',
  42 |               year: '1927',
  43 |               createdAt: new Date().toISOString()
  44 |             }
  45 |           ]),
  46 |         });
  47 |       } else {
  48 |         await route.continue();
  49 |       }
  50 |     });
  51 | 
  52 |     // 3. Intercepta requisições ao Internet Archive para simular o streaming instantaneamente
  53 |     await page.route('**/archive.org/**', async (route) => {
  54 |       await route.fulfill({
  55 |         status: 200,
  56 |         contentType: 'video/mp4',
  57 |         body: Buffer.from('bytes-falsos-de-video-para-teste'),
  58 |       });
  59 |     });
  60 | 
  61 |     // 4. Vai direto para a URL do Frontend (ele pulará a Welcome/Login e abrirá o catálogo)
  62 |     await page.goto(FRONTEND_URL);
  63 | 
  64 |     // 5. Interage com a grade de filmes real do seu Home.tsx (.movies-grid)
  65 |     const catalogGrid = page.locator('.movies-grid');
> 66 |     await expect(catalogGrid).toBeVisible({ timeout: 30000 });
     |                               ^ Error: expect(locator).toBeVisible() failed
  67 | 
  68 |     // 6. Clica no elemento clicável (role="button") mapeado no seu mapeamento do array .map()
  69 |     const firstMovieCard = catalogGrid.locator('[role="button"]').first();
  70 |     await expect(firstMovieCard).toBeVisible();
  71 |     await firstMovieCard.click({ force: true });
  72 | 
  73 |     // 7. Valida o comportamento da sua feature na tela de detalhes
  74 |     // O seu Home.tsx redireciona para a rota no singular: /movie/:id
  75 |     await page.waitForURL(/.*\/movie\/.*/, { timeout: 30000 });
  76 | 
  77 |     // Confere se as tags de teste receberam os textos mockados
  78 |     await expect(page.getByTestId('movie-synopsis')).toHaveText('Uma obra-prima da ficção científica distópica clássica.');
  79 |     await expect(page.getByTestId('movie-director')).toBeVisible();
  80 | 
  81 |     // 8. Dispara o Player de Vídeo e valida a injeção da tag <video>
  82 |     const btnAssistir = page.getByTestId('btn-assistir');
  83 |     await expect(btnAssistir).toBeVisible();
  84 |     await btnAssistir.click({ force: true });
  85 | 
  86 |     const videoPlayer = page.locator('video');
  87 |     await expect(videoPlayer).toBeVisible({ timeout: 30000 });
  88 | 
  89 |     const videoSrc = await videoPlayer.getAttribute('src');
  90 |     expect(videoSrc).toBeTruthy();
  91 |   });
  92 | });
```