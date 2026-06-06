import { prisma } from '../database/prisma-client';

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: any) => {
    return await prisma.user.create({ data });
};

export const findUserById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id } });
};

export const deleteUser = async (id: string) => {
    return await prisma.user.delete({ where: { id } });
};
