import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:5173'; 
const BACKEND_URL = 'http://localhost:3000';

test.describe('Teste de Feature Isolado', () => {

  test('Deve injetar a sessão, carregar os filmes e testar a feature', async ({ page, context }) => {
    
    // 1. Injeta o usuário diretamente no localStorage do navegador ANTES de acessar a URL
    // Isso faz o App.tsx entender que você já está logado
    await context.addInitScript(() => {
      const sessionUser = {
        id: 'user-uuid-de-teste-123',
        name: 'Tester Classic',
        email: 'lessl@cin.ufpe.br',
        role: 'usuario',
        token: 'jwt-falso-de-teste'
      };
      window.localStorage.setItem('cinema_logged_user', JSON.stringify(sessionUser));
    });

    // 2. Intercepta a chamada do movieService para retornar o filme simulado imediatamente
    await page.route(`${BACKEND_URL}/movies`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' }, // Evita bloqueios de CORS internos no Docker
          body: JSON.stringify([
            {
              id: 'a9b8c7d6-e5f4-3210-abcd-ef0123456789', // ID que será passado para a página de detalhes
              title: 'Metropolis',
              file_name: 'https://archive.org/download/metropolis-1927/video.mp4',
              img_url: 'https://lh3.googleusercontent.com/placeholder',
              synopsis: 'Uma obra-prima da ficção científica distópica clássica.',
              genres: 'Ficção Científica, Drama',
              isPopular: true,
              duration: '153',
              director: 'Fritz Lang',
              cast: 'Alfred Abel, Brigitte Helm',
              year: '1927',
              createdAt: new Date().toISOString()
            }
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // 3. Intercepta requisições ao Internet Archive para simular o streaming instantaneamente
    await page.route('**/archive.org/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: Buffer.from('bytes-falsos-de-video-para-teste'),
      });
    });

    // 4. Vai direto para a URL do Frontend (ele pulará a Welcome/Login e abrirá o catálogo)
    await page.goto(FRONTEND_URL);

    // 5. Interage com a grade de filmes real do seu Home.tsx (.movies-grid)
    const catalogGrid = page.locator('.movies-grid');
    await expect(catalogGrid).toBeVisible({ timeout: 30000 });

    // 6. Clica no elemento clicável (role="button") mapeado no seu mapeamento do array .map()
    const firstMovieCard = catalogGrid.locator('[role="button"]').first();
    await expect(firstMovieCard).toBeVisible();
    await firstMovieCard.click({ force: true });

    // 7. Valida o comportamento da sua feature na tela de detalhes
    // O seu Home.tsx redireciona para a rota no singular: /movie/:id
    await page.waitForURL(/.*\/movie\/.*/, { timeout: 30000 });

    // Confere se as tags de teste receberam os textos mockados
    await expect(page.getByTestId('movie-synopsis')).toHaveText('Uma obra-prima da ficção científica distópica clássica.');
    await expect(page.getByTestId('movie-director')).toBeVisible();

    // 8. Dispara o Player de Vídeo e valida a injeção da tag <video>
    const btnAssistir = page.getByTestId('btn-assistir');
    await expect(btnAssistir).toBeVisible();
    await btnAssistir.click({ force: true });

    const videoPlayer = page.locator('video');
    await expect(videoPlayer).toBeVisible({ timeout: 30000 });

    const videoSrc = await videoPlayer.getAttribute('src');
    expect(videoSrc).toBeTruthy();
  });
});