-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "movies" TEXT[] DEFAULT ARRAY[]::TEXT[];
