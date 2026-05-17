import prisma from '../database/prisma';

export class AccountRepository {
   async findById(id: string) {
      return await prisma.user.findUnique({ where: { id } });
   }

   async findByEmail(email: string) {
      return await prisma.user.findUnique({ where: { email } });
   }

   async update(id: string, data: any) {
      return await prisma.user.update({
         where: { id },
         data: {
            name: data.name,
            email: data.email,
            password: data.password,
            avatarUrl: data.photo
         }
      });
   }
}
