import { PrismaClient } from '../generated/prisma';
const prisma = new PrismaClient();

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

export const updateUser = async (id: string, data: any) => {
    return await prisma.user.update({ where: { id }, data });
};


export const createPreRegistration = async (data: any) => {
    return await prisma.preRegistration.create({ data });
};

export const findPreRegistrationByEmail = async (email: string) => {
    return await prisma.preRegistration.findUnique({ where: { email } });
};

export const deletePreRegistration = async (id: string) => {
    return await prisma.preRegistration.delete({ where: { id } });
};