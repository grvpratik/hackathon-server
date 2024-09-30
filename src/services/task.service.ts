import { Platforms, TaskStatus } from "@prisma/client";
import { prisma } from "..";
//payer
export async function createTask(
    payerId: string,
    platform: Platforms,
    taskName: string,
    amount: number,
    signature: string,
    taskLink: string,
    endDate: Date,
    comment?: string,) {
    return await prisma.task.create({
        data: {
            platform,
            task_name: taskName,
            amount,
            signature,
            task_link: taskLink,
            comment,
            payer_id: payerId,
            status: TaskStatus.Hold,
            endDate
        }
    });
}

export async function updateTaskStatus(taskId: string, signature: string) {
    return await prisma.task.update({
        where: { id: taskId },
        data: {
            signature: signature,
            status: TaskStatus.Active,
        },
    });
}

export async function getTasksForPayer(payerId: string) {
    return await prisma.task.findMany({
        where: { payer_id: payerId },
    });
}

export async function getPayerSignature(signature: string) {
    return await prisma.task.findMany({
        where: { signature },
    });
}


export async function getTasksForUser(userId: string) {
    return await prisma.task.findMany({
        where: {
            NOT: {
                submissions: {
                    some: {
                        user_id: userId
                    }
                }
            },
            status: TaskStatus.Active
        }
    })
}