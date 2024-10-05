import { prisma } from "..";

export async function gameAccInfo(userId:string) {
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
            id:dungeonId
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