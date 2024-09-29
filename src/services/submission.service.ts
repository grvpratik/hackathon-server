import { prisma } from "..";

export const SubmissionService= {
    async isDuplicateSubmission(userId: string, imageHash: string) {
        const submission = await prisma.submission.findFirst({
            where: { user_id: userId, proof: imageHash },
        });
        return !!submission;
    }
,
    async createSubmission(userId: string, pending: any, imageHash: string) {
        return prisma.$transaction(async (prismaTx) => {
            const subTask = await prismaTx.submission.create({
                data: {
                    user_id: userId,
                    task_id: pending.taskId,
                    amount: pending.amount!,
                    proof: imageHash,
                },
            });

            const updatedUser = await prismaTx.user.update({
                where: { id: userId },
                data: { points: { increment: pending.amount! } },
            });

            await prismaTx.proof.delete({
                where: {
                    userId,
                    taskId: pending.taskId,
                    telegram_id: pending.telegram_id,
                },
            });

            return { subTask, updatedUser };
        }, {
            maxWait: 5000,
            timeout: 10000,
        });
    }
}
