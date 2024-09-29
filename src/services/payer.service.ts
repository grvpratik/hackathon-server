import { PrismaClient } from '@prisma/client';
import { prisma } from '..';


export async function checkPayer(telegramId: number, firstName?: string, lastName?: string, address?: string) {
    const existingPayer = await prisma.payer.findUnique({
        where: { telegram_id: telegramId },
    });

    if (existingPayer) {
        return existingPayer;
    }

    return await prisma.payer.create({
        data: {
            telegram_id: telegramId,
            first_name: firstName,
            Last_name: lastName,
            address: address,
        },
    });
}

export async function updatePayerWallet(payerId: string, publicKey: string) {
    return await prisma.payer.update({
        where: { id: payerId },
        data: { address: publicKey },
    });
}

export async function checkPayerFound(telegramId:number) {
    return await prisma.payer.findFirst({
        where: {
            telegram_id:telegramId
        }
    })
}

export async function findPayerById(payerId:string) {
    return await prisma.payer.findUnique({
        where: { id: payerId },
    });
}
export const PayerService = {
    async checkOrCreatePayer(telegramId: number, firstName?: string, lastName?: string, address?: string) {
        return await prisma.payer.upsert({
            where: { telegram_id: telegramId },
            update: {},
            create: {
                telegram_id: telegramId,
                first_name: firstName,
                Last_name: lastName,
                address: address,
            },
        });
    },

    async updatePayerWallet(payerId: string, publicKey: string) {
        return await prisma.payer.update({
            where: { id: payerId },
            data: { address: publicKey },
        });
    },
};
