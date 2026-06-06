/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId,watchedAt]` on the table `History` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "History_userId_movieId_watchedAt_key" ON "History"("userId", "movieId", "watchedAt");
