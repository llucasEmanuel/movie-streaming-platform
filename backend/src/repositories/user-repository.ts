import { PrismaClient } from '../generated/prisma';
const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: any) => {
    return await prisma.user.create({ data });
};