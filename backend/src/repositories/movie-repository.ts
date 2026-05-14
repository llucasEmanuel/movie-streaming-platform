import { prisma } from "../database/prisma-client";

export class MovieRepository {
  async findById(id: string) {
    return await prisma.movie.findUnique({
      where: { id }
    });
  }

  async save(data: any) {
    return await prisma.movie.create({ data });
  }
}