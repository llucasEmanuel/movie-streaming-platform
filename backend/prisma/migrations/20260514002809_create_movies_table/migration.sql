-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "file_name" TEXT NOT NULL,
    "synopsis" TEXT,
    "genres" TEXT,
    "duration" TEXT,
    "director" TEXT,
    "cast" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);
