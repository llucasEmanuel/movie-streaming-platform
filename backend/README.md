# 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor com nodemon e ts-node (utilizado para rodar o backend no dia-a-dia)

- `npm run build`: Compila o código TypeScript para JavaScript na pasta dist.

- `npm start`: Roda o código compilado da pasta dist (só vai ser utilizado no deploy).

# 📁 Estrutura de Arquivos

- `src/`: Código fonte do backend.

- `dist/`: Código compilado (só aparece se rodar o script de build, mas não é necessário agora).

- `tsconfig.json`: Configurações do compilador TypeScript.

# ⚙️ Como Rodar o Backend?
Estando dentro do *devcontainer* e dentro da pasta `movie-streaming-platform/`, é necessário ir para a pasta `backend/` e, em seguida, rodar o *script* `dev`. Isso pode ser feito pelo seguinte comando:

```bash
cd backend && npm run dev
```