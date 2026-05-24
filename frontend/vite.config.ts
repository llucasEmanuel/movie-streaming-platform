import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // CRUCIAL: Permite acesso externo ao container
    port: 5173,      // Porta que você mapeou no devcontainer/docker-compose
    strictPort: true, // Se a porta estiver ocupada, ele não tenta outra (evita erro de porta errada)
    watch: {
      usePolling: true, // Necessário para o Hot Reload funcionar no Docker (especialmente no Windows/WSL)
    },
  },
})