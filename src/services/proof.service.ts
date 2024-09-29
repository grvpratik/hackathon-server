import { prisma } from "..";

export const ProofService = {
    async findPendingProof(userId: string, telegramId: number) {
        return prisma.proof.findFirst({
            where: { userId, telegram_id: telegramId },
        });
    }
    ,
    async deleteProof(userId: string, taskId: string, telegramId: number) {
        return prisma.proof.delete({
            where: {
                userId,
                taskId,
                telegram_id: telegramId,
            },
        });
    }
}