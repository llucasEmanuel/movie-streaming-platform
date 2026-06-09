# 🎬 CInema - Plataforma de Streaming de Cinema Clássico

O **CInema** é uma plataforma web definitiva e imersiva dedicada à preservação, catalogação e streaming de grandes obras-primas e raridades do cinema antigo. O projeto combina uma interface moderna com um ecossistema robusto capaz de gerenciar catálogos, busca personalizada, gerenciamento de playlists, recomendações, autenticação segura, customização de perfil de usuário, persistência de progresso e reprodução de vídeo via streaming.

---

## 🚀 Como Executar o Sistema

O repositório está estruturado em dois ecossistemas independentes (Multirepo/Monorepo): o **Frontend** (Vite + React + TypeScript) e o **Backend** (Node.js + Express + Prisma + PostgreSQL). Ambos utilizam o script padronizado `npm run dev` para inicialização em ambiente de desenvolvimento.

### Pré-Requisitos
Certifique-se de ter instalado em sua máquina:
* **Node.js** (versão 24)
* **NPM**
* **Docker**
* **Dev Containers**

### Passo-a-passo da execução

- Clone o repositório na sua máquina e em seguida abra-o com o VSCode.
- Aperte `Ctrl+Shift+P` e digite `Reopen in Container`.
- Em seguida, o VSCode deve carregar os containeres do sistema (caso seja a primeira vez executando o projeto, é provável que as imagens Docker sejam buildadas, o que leva um tempo)
- Ao final do carregamento dos containeres, é necessário garantir que todos os pacotes estejam instalados, então
  - Instalação de Dependências
  Abra um terminal no ambiente do Dev Container e execute:
  ```bash
  npm install # Dependências globais
  cd backend && npm install # Dependências de backend
  cd ../frontend && npm install # Dependências de frontend
  ```
  
  Configuração e Migração do Banco de Dados
  O Dev Container já expõe o motor do Docker para gerenciar o PostgreSQL. No terminal do backend, configure suas variáveis de ambiente criando um arquivo .env baseado no exemplo abaixo
  
  ```.env
  DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/cinema_db?schema=public"
  EMAIL_USER=user@email.com
  EMAIL_PASS=password
  ```
  
  Em seguida, execute o gerador do Prisma para estruturar as tabelas mapeadas no banco:
  
  ```  
  npx prisma generate
  npx prisma migrate dev
  ```

  Após isso, o sistema deve estar pronto para ser executado, sendo necessário apenas executar na raíz do repositório: 
  ```
  npm run dev
  ```
  Com isso, a interface estará disponível para interação em `http://localhost:5173`.
  
