import { prisma } from "..";


export const UserService = {
    async checkOrCreateUser(telegramId: number, firstName?: string, lastName?: string, address?: string) {
        const user= await prisma.user.upsert({
            where: { telegram_id: telegramId },
            update: {},
            create: {
                telegram_id: telegramId,
                first_name: firstName ?? "",
                last_name: lastName ?? "",

            },
        });
      
        if (user.createdAt === user.updatedAt) { 
            await prisma.gameAccount.create({
                data: {
                    userId: user.id,
                   
                    knight_lvl: 1, 
                    knight_exp: 0,
                    mage_lvl: 1,
                    mage_exp: 0,
                    beast_lvl: 1,
                    beast_exp: 0,
                },
            });
        }
        return user;
    },
   
    async checkUser(userId: string) {
        return await prisma.user.findFirst({
            where: {
                id: userId
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