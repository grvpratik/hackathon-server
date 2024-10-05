import { NextFunction, Request, Response } from "express";
import { getInitData } from "../middlewares/user.middleware";
import { UserService } from "../services/user.service";
import { gameAccInfo, getdungeonById, getdungeonList } from "../services/game.service";


export async function gameAccountInfo(req: Request, res: Response, next: NextFunction) { 
    const client = getInitData(res);

    // Ensure client data is valid
    if (!client?.user?.id) {
        return res.status(400).json({ error: "Invalid client data" });
    }
    const tg = client?.user?.id
    const user = await UserService.findUserByTelegramId(tg)
    // Ensure client data is valid
    if (!user) {
        return res.status(400).json({ error: "user not found" });
    }
    const account = await gameAccInfo(user.id)
    return res.status(200).json({ success:true,account });
}

export async function gameDungeonList(req: Request, res: Response, next: NextFunction) {

    const dungeon = await getdungeonList();
    return res.status(200).json({ success: true, dungeon });
}
 

export async function activeDungeonRaid(req: Request, res: Response, next: NextFunction) {
    const userId = ""
    //find dungeonraid where userid and active /completed/clain

}



export async function startDungeonRaid(req: Request, res: Response, next: NextFunction) {
    const userId = ""
    const gameacc=await gameAccInfo(userId)
    const gameId = gameacc!.id
    const dungeonId="" //params or query
   const dungeon= await getdungeonById(dungeonId)
    //check level


    
            const endTime = new Date(Date.now() + dungeon!.timeToComplete * 1000)

            const dungeonRaid = await prisma.$transaction(async (prisma) => {
                // Deduct tokens and energy
                await prisma.gameUser.update({
                    where: { id: userId },
                    data: {
                        tokens: { decrement: dungeon!.entryTokens },
                        // energy: { decrement: dungeon.energyCost }
                    }
                })

                return prisma.dungeonRaid.create({
                    data: {
                        userId,
                        dungeonId,
                        endTime
                    }
                })
            })
  
}

export async function claimDungeonReward(req: Request, res: Response, next: NextFunction) {
   // const raid = await prisma.dungeonRaid.findUnique({
    //             where: { id: raidId },
    //             include: {
    //                 user: true,
    //                 dungeon: {
    //                     include: { baseReward: true, silverReward: true, goldReward: true }
    //                 }
    //             }
    //         })

    //         if (!raid || !raid.completed || raid.claimed) {
    //             return { success: false, error: 'Invalid raid or already claimed' }
    //         }

    //         // Determine reward tier
    //         const rewardTier = await this.determineRewardTier(raid.user.level, raid.dungeon)

    //         // Calculate experience gain
    //         const experience = raid.dungeon.baseExperience

    //         await prisma.$transaction(async (prisma) => {
    //             // Update user experience and possibly level
    //             const updatedUser = await this.addExperience(raid.userId, experience)

    //             // If user got top reward, reduce their level by half
    //             if (rewardTier === 'gold') {
    //                 await prisma.gameUser.update({
    //                     where: { id: raid.userId },
    //                     data: { level: Math.ceil(updatedUser.level / 2) }
    //                 })
    //             }

    //             // Mark raid as claimed and record rewards
    //             await prisma.dungeonRaid.update({
    //                 where: { id: raidId },
    //                 data: {
    //                     claimed: true,
    //                     rewardTier,
    //                     experience,
    //                     tokenAmount: this.getTokenAmount(raid.dungeon, rewardTier)
    //                 }
    //             })

    //             // Update achievements
    //             await this.updateAchievements(raid.userId)
    //         })
   
}


