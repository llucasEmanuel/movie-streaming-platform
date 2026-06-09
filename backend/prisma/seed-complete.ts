/// <reference types="node" />
import { config } from "dotenv";
config(); // Carrega o .env antes do Prisma
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🔄 Limpando o banco de dados antes de popular com a Seed Completa...",
  );
  await prisma.history.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();
  await prisma.playlist.deleteMany();

  // Ação e Aventura
  const m1 = await prisma.movie.create({
    data: {
      title: "Oppenheimer",
      genres: "Drama",
      isPopular: true,
      isDeleted: false,
      synopsis:
        "A história do cientista J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica.",
      duration: "180",
      director: "Christopher Nolan",
      cast: "Cillian Murphy, Emily Blunt, Matt Damon",
      file_name: "https://www.w3schools.com/html/mov_bbb.mp4", // Video de exemplo
      img_url:
        "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    },
  });

  // Comédia 

  const m2 = await prisma.movie.create({
    data: {
      title: "Steamboat Willie",
      genres: "Comédia",
      isPopular: true,
      isDeleted: false,
      synopsis:
        "Curta-metragem em preto e branco da Walt Disney Studios de 1928 estrelado por Mickey Mouse",
      duration: "8",
      director: "Walt Disney",
      cast: "Mickey Mouse, Minnie Mouse",
      file_name: "https://dn721909.ca.archive.org/0/items/steamboat-willie_1928/steamboat-willie_1928.mp4",
      img_url:
        "https://dn800306.us.archive.org/0/items/steamboat-willie_1928/__ia_thumb.jpg",
    },
  });

  const m3 = await prisma.movie.create({
    data: {
      title: "The Skeleton Dance",
      genres: "Comédia",
      isPopular: false,
      isDeleted: false,
      synopsis:
        "Quatro esqueletos humanos dançam e fazem música em torno de um assustador cemitério",
      duration: "8",
      director: "Walt Disney",
      cast: "Skeleton 1, Skeleton 2, Skeleton 3, Skeleton 4",
      file_name: "https://dn710808.ca.archive.org/0/items/the-skeleton-dance_1929/the-skeleton-dance_1929.mp4",
      img_url:
        "https://dn710808.ca.archive.org/0/items/the-skeleton-dance_1929/__ia_thumb.jpg",
    },
  });

  // Ficção Científica

  const m4 = await prisma.movie.create({
    data: {
      title: "Battle In Outer Space",
      genres: "Ficção Científica",
      isPopular: false,
      isDeleted: false,
      synopsis:
        "Extraterrestes invadem a Terra rendendo cidades e causando destruição em massa no Japão, Itália e Panamá. As Nações Unidas convocam diversos países para um contra-ataque, iniciando aquela que será a maior batalha intergaláctica do Universo.",
      duration: "93",
      director: "Ishirô Honda",
      cast: "Kyôko Anzai, Yoshio Tsuchiya, Leonard Stanford",
      file_name: "https://dn711405.ca.archive.org/0/items/battle-in-outer-space-1959_202505/Battle%20in%20Outer%20Space%20-%2001%201959.mp4",
      img_url:
        "https://dn711405.ca.archive.org/0/items/battle-in-outer-space-1959_202505/__ia_thumb.jpg",
    },
  });

  const m5 = await prisma.movie.create({
    data: {
      title: "The Time Travelers",
      genres: "Ficção Científica",
      isPopular: true,
      isDeleted: false,
      synopsis:
        "A trama acompanha um grupo de cientistas que descobre que, devido a uma sobrecarga elétrica, sua tela de visualização do tempo de repente se transforma em um portal. Eles são transportados para um futuro sombrio e pós-apocalíptico onde os poucos humanos normais restantes lutam para sobreviver a ataques de mutantes.",
      duration: "82",
      director: "Ib Melchior",
      cast: "John Hoyt",
      file_name: "https://ia601702.us.archive.org/30/items/the.-time.-travelers.-1964/The%20Time%20Travelers%20%281964%29/mp4/The.Time.Travelers.1964.mp4",
      img_url:
        "https://ia801702.us.archive.org/30/items/the.-time.-travelers.-1964/__ia_thumb.jpg",
    },
  });

  // Animação 

  const m6 = await prisma.movie.create({
    data: {
      title: "Popeye for President",
      genres: "Animação",
      isPopular: false,
      isDeleted: false,
      synopsis:
        "A história acompanha a acirrada disputa eleitoral entre o marinheiro e seu eterno rival, Brutus, que estão empatados na corrida pela presidência.",
      duration: "8",
      director: "Dave Fleischer",
      cast: "Popeye, Brutus",
      file_name: "https://ia601303.us.archive.org/9/items/Popeye_forPresident/Popeye_forPresident_512kb.mp4",
      img_url:
        "https://dn721604.ca.archive.org/0/items/Popeye_forPresident/__ia_thumb.jpg",
    },
  });


  console.log("✅ Banco de dados populado com a SEED COMPLETA!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });