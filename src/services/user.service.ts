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
    async  checkUser(telgramId:number) {
        return await prisma.user.findFirst({
            where: {
                telegram_id: telgramId
            }
        })
    }
}