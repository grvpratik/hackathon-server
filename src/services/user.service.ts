import { prisma } from "..";


export const UserService = {
    async checkOrCreateUser(telegramId: number, firstName?: string, lastName?: string, address?: string) {
        return await prisma.payer.upsert({
            where: { telegram_id: telegramId },
            update: {},
            create: {
                telegram_id: telegramId,
                first_name: firstName,
                Last_name: lastName,
            },
        });
    },
    async checkUser(telgramId: number) {
        return await prisma.user.findFirst({
            where: {
                telegram_id: telgramId
            }
        })
    },
    async findUserByTelegramId(telegramId: number) {
        return prisma.user.findFirst({
            where: { telegram_id: telegramId },
        });
    }
    ,
    async updateUserPoints(userId: string, points: number) {
        return prisma.user.update({
            where: { id: userId },
            data: { points: { increment: points } },
        });
    }
}