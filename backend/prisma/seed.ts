import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Limpando o banco de dados antes de popular...');
  await prisma.history.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();
  await prisma.playlist.deleteMany();

  console.log('🎬 Criando os usuários de teste...');
  const salt = await bcrypt.genSalt(10);
  const hashCarlos = await bcrypt.hash("Senha@123", salt);
  const hashMaria = await bcrypt.hash("Maria@123", salt);
  const hashJulio = await bcrypt.hash("Julio@123", salt);

  const usuarioCarlos = await prisma.user.create({
    data: {
      id: "1",
      name: "Carlos",
      email: "carlos@email.com",
      password: hashCarlos,
      avatarUrl: "foto.png",
    }
  });

  const usuarioMaria = await prisma.user.create({
    data: {
      id: "2",
      name: "Maria",
      email: "maria@email.com",
      password: hashMaria,
    }
  });

  const usuarioJulio = await prisma.user.create({
    data: {
      id: "usuario-julio-id",
      name: "Júlio César",
      email: "julio@teste.com",
      password: hashJulio,
    }
  });

  console.log('🍿 Criando catálogo de filmes ativos e populares...');
  // Filmes de Ação
  const v1 = await prisma.movie.create({
    data: { title: "Vingadores: Ultimato", genres: "Ação", isPopular: true, isDeleted: false, synopsis: "O confronto final contra Thanos.", duration: "181 min" }
  });
  const v2 = await prisma.movie.create({
    data: { title: "Círculo de Fogo", genres: "Ação", isPopular: false, isDeleted: false, synopsis: "Robôs gigantes vs Monstros gigantes.", duration: "131 min" }
  });
  await prisma.movie.create({
    data: { title: "Matrix", genres: "Ação", isPopular: true, isDeleted: false, synopsis: "A realidade é uma simulação.", duration: "136 min" }
  });

  // Filmes de Comédia
  const c1 = await prisma.movie.create({
    data: { title: "Cabras da Peste", genres: "Comédia", isPopular: true, isDeleted: false, synopsis: "Dois policiais do Ceará e de São Paulo resolvem um caso.", duration: "97 min" }
  });
  await prisma.movie.create({
    data: { title: "Superbad", genres: "Comédia", isPopular: false, isDeleted: false, synopsis: "Dois amigos tentam comprar bebida para uma festa.", duration: "113 min" }
  });

  // Filmes de Terror
  const t1 = await prisma.movie.create({
    data: { title: "Invocação do Mal", genres: "Terror", isPopular: false, isDeleted: false, synopsis: "Investigadores paranormais ajudam uma família.", duration: "112 min" }
  });
  const t2 = await prisma.movie.create({
    data: { title: "O Exorcista", genres: "Terror", isPopular: true, isDeleted: false, synopsis: "Uma jovem é possuída por uma entidade misteriosa.", duration: "122 min" }
  });
  const t3 = await prisma.movie.create({
    data: { title: "Midsommar", genres: "Terror", isPopular: false, isDeleted: false, synopsis: "Um festival de verão sueco se transforma em pesadelo.", duration: "148 min" }
  });

  // Filme Deletado (Para testar se seu front vai ignorar de verdade!)
  await prisma.movie.create({
    data: { title: "Filme Fantasma Deletado", genres: "Ação", isPopular: true, isDeleted: true, synopsis: "Este filme nunca deve aparecer.", duration: "120 min" }
  });

  await prisma.movie.create({
    data: { title: "Hereditário", genres: "Terror", isPopular: true, isDeleted: false, synopsis: "Após a morte da avó, uma família começa a descobrir segredos sombrios sobre seus ancestrais.", duration: "127 min" }
  });

  await prisma.movie.create({
    data: { title: "Invocação do Mal 2", genres: "Terror", isPopular: true, isDeleted: false, synopsis: "Os investigadores paranormais Ed e Lorraine Warren viajam para a Inglaterra para ajudar uma mãe solteira.", duration: "134 min" }
  });

  await prisma.movie.create({
    data: { title: "Corra!", genres: "Terror", isPopular: true, isDeleted: false, synopsis: "Um jovem fotógrafo descobre um segredo sombrio ao visitar os pais da sua namorada.", duration: "104 min"}
  });

  await prisma.movie.create({
    data: { title: "A Bruxa", genres: "Terror", isPopular: false, isDeleted: false, synopsis: "Na Nova Inglaterra de 1630, uma família de colonos é dizimada por forças de bruxaria e magia negra.", duration: "92 min" }
  });

  await prisma.movie.create({
    data: { title: "Um Lugar Silencioso", genres: "Terror", isPopular: true, isDeleted: false, synopsis: "Uma família precisa lutar para sobreviver em silêncio absoluto para não ser caçada por criaturas cegas.", duration: "90 min" }
  });

  // ─── 📥 NOVAS ADIÇÕES PARA OS TESTES E2E DE METADADOS DO CUCUMBER ─────────────
  console.log('🤖 Inserindo cenários de teste controlados para o Cucumber...');
  
  // 1. Metropolis (Metadados Completos)
  await prisma.movie.create({
    data: {
      id: "00000000-0000-0000-0000-000000000001", // ID amarrado ao mapeamento 'Metropolis' no front-end
      title: "Metropolis",
      synopsis: "Numa cidade futurística...",
      genres: "Drama, Ficção Científica",
      duration: "153 minutos", // Ajustado para bater com o dataTable do teste
      year: "1927",             // Se o seu banco aceitar string/Int, garanta coerência
      director: "Fritz Lang",
      cast: "Brigitte Helm, Alfred Abel, Gustav Fröhlich",
      isPopular: false,
      isDeleted: false
    }
  });

  // 2. The Rink (Título populado, resto N/A / Null)
  await prisma.movie.create({
    data: {
      id: "00000000-0000-0000-0000-000000000002",
      title: "The Rink",
      synopsis: "N/A",  // Forçando "N/A" se seu front ler direto do banco,
      genres: "N/A",    // ou mude para null caso seu front trate valores nulos 
      duration: "N/A",  // transformando-os em "N/A" na tela automaticamente.
      year: "N/A",
      director: "N/A",
      cast: "N/A",
      isPopular: false,
      isDeleted: false
    }
  });

  // 3. Filme Sem Título (Tudo N/A / Null)
  await prisma.movie.create({
    data: {
      id: "00000000-0000-0000-0000-000000000003",
      title: "N/A",
      synopsis: "N/A",
      genres: "N/A",
      duration: "N/A",
      year: "N/A",
      director: "N/A",
      cast: "N/A",
      isPopular: false,
      isDeleted: false
    }
  });

  await prisma.movie.create({
    data: {
      id: "00000000-0000-0000-0000-000000000004",
      title: "A Noite dos Mortos Vivos",
      synopsis: "Zumbis atacam um grupo de sobreviventes refugiados em uma fazenda.",
      genres: "Terror",
      duration: "96 min",
      year: "1968",
      director: "George A. Romero",
      cast: "Duane Jones, Judith O'Dea, Karl Hardman",
      isPopular: true,
      isDeleted: false
    }
  });
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('⏳ Simulando histórico de visualização (Regra dos 7 dias)...');
  // Júlio assistiu Vingadores hoje (Gera playlist "Porque você assistiu Vingadores")
  await prisma.history.create({
    data: { userId: usuarioJulio.id, movieId: v1.id, watchedAt: new Date(), is_completed: true,is_hidden: false}});

  // Júlio assistiu 3 filmes de Terror recentemente (Gera a playlist "Recomendações de Terror")
  await prisma.history.create({
    data: { userId: usuarioJulio.id, movieId: t1.id, watchedAt: new Date(), is_completed: true,is_hidden: false }
  });
  await prisma.history.create({
    data: { userId: usuarioJulio.id, movieId: t2.id, watchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), is_completed: true,is_hidden: false }
  });
  await prisma.history.create({
    data: { userId: usuarioJulio.id, movieId: t3.id, watchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), is_completed: true,is_hidden: false }
  });
  await prisma.history.create({
    data: { userId: usuarioJulio.id, movieId: v2.id, watchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), is_completed: true,is_hidden: false } // Ontem
  });

  console.log('✅ Banco de dados populado com sucesso para testes manuais e E2E!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });