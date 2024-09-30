import { prisma } from "..";

export const ProofService = {
    async findPendingProof(userId: string, telegramId: number) {
        return prisma.proof.findFirst({
            where: { userId, telegram_id: telegramId },
        });
    }
    , async deletePendingProof(userId: string, telegramId: number) {
        return prisma.proof.deleteMany({
            where: { userId, telegram_id: telegramId },
        });
    },
    async deleteProof(userId: string, taskId: string, telegramId: number) {
        return prisma.proof.delete({
            where: {
                userId,
                taskId,
                telegram_id: telegramId,
            },
        });
    },async  createProof(chatId:number,userId:string,taskId:string,amount:number) {
        return await prisma.proof.create({
            data: {
                telegram_id: chatId,
                userId,
                taskId,
                amount,

            }
        });
    }
}