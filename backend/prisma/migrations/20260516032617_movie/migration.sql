/*
  Warnings:

  - You are about to drop the column `director` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `Movie` table. All the data in the column will be lost.
  - The `genres` column on the `Movie` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cast` column on the `Movie` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `url_movie` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_poster` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Movie` required. This step will fail if there are existing NULL values in that column.
  - Made the column `synopsis` on table `Movie` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `duration` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "director",
DROP COLUMN "file_name",
ADD COLUMN     "directors" TEXT[],
ADD COLUMN     "url_movie" TEXT NOT NULL,
ADD COLUMN     "url_poster" TEXT NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "synopsis" SET NOT NULL,
DROP COLUMN "genres",
ADD COLUMN     "genres" TEXT[],
DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL,
DROP COLUMN "cast",
ADD COLUMN     "cast" TEXT[];
