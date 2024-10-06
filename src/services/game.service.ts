import { RaidStatus } from "@prisma/client";
import { prisma } from "..";

export async function gameAccInfo(userId: string) {
    return await prisma.gameAccount.findFirst({
        where: {
            userId: userId
        }
    })
}


export async function getdungeonList(userId?: string) {
    return await prisma.dungeon.findMany();
}
export async function getdungeonById(dungeonId?: string) {
    return await prisma.dungeon.findFirst({
        where: {
            id: dungeonId
        }
    });
}
export async function createRaid(userId: string,gameId:string, entryTokens: number,dungeonId:string,endTime:Date) {
     await prisma.$transaction(async (prisma) => {
        // Deduct tokens and energy
        await prisma.user.update({
            where: { id: userId },
            data: {

                points: { decrement: entryTokens },
                // energy: { decrement: dungeon.energyCost }
            }
        })

     return  await  prisma.dungeonRaid.create({
           data: {
                status:RaidStatus.active,
                gameId:gameId,
                dungeonId,
                endTime
            }
        })
    })

}

export async function getRaidById(dungeonId?: string) {
    return await prisma.dungeonRaid.findFirst({
        where: {
            id: dungeonId
        }
    });
}
// export async function getGameAccId(userId: string) {
//     return await prisma.gameAccount.findFirst({
//         where: {
//             userId:userId
//         }
//     })
// }