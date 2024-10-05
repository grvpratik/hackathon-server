// // src/game/dungeonLogic.ts
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// export class DungeonGame {
//     // Experience required for each level, starting at level 1
//     private static levelExpRequirements = [
//         0, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000
//     ]

//     static async startDungeonRaid(userId: string, dungeonId: string): Promise<Result> {
//         const user = await prisma.gameUser.findUnique({ where: { id: userId } })
//         const dungeon = await prisma.dungeon.findUnique({
//             where: { id: dungeonId },
//             include: { baseReward: true, silverReward: true, goldReward: true }
//         })

//         if (!user || !dungeon) {
//             return { success: false, error: 'User or dungeon not found' }
//         }

//         // Check requirements
//         if (user.level < dungeon.minimumLevel) {
//             return { success: false, error: 'Level requirement not met' }
//         }
//         if (user.tokens < dungeon.entryTokens) {
//             return { success: false, error: 'Not enough tokens' }
//         }
//         if (user.energy < dungeon.energyCost) {
//             return { success: false, error: 'Not enough energy' }
//         }

//         // Start the raid
//         const endTime = new Date(Date.now() + dungeon.timeToComplete * 1000)

//         const dungeonRaid = await prisma.$transaction(async (prisma) => {
//             // Deduct tokens and energy
//             await prisma.gameUser.update({
//                 where: { id: userId },
//                 data: {
//                     tokens: { decrement: dungeon.entryTokens },
//                     energy: { decrement: dungeon.energyCost }
//                 }
//             })

//             return prisma.dungeonRaid.create({
//                 data: {
//                     userId,
//                     dungeonId,
//                     endTime
//                 }
//             })
//         })

//         return { success: true, data: dungeonRaid }
//     }

//     static async claimDungeonReward(raidId: string): Promise<Result> {
//         const raid = await prisma.dungeonRaid.findUnique({
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

//         return { success: true, data: { rewardTier, experience } }
//     }

//     private static async determineRewardTier(userLevel: number, dungeon: any): Promise<string> {
//         const baseChance = 0.95 // 95% chance for base reward
//         const levelFactor = (userLevel - dungeon.minimumLevel) * 0.02 // 2% increase per level

//         const roll = Math.random()
//         let adjustedRoll = roll - levelFactor

//         if (adjustedRoll > baseChance) {
//             // Determine between silver and gold
//             const silverChance = 0.8 // 80% of remaining 5%
//             return Math.random() > silverChance ? 'gold' : 'silver'
//         }

//         return 'base'
//     }

//     private static getTokenAmount(dungeon: any, tier: string): number {
//         switch (tier) {
//             case 'gold':
//                 return dungeon.goldReward.tokenAmount
//             case 'silver':
//                 return dungeon.silverReward.tokenAmount
//             default:
//                 return dungeon.baseReward.tokenAmount
//         }
//     }

//     private static async addExperience(userId: string, exp: number): Promise<any> {
//         const user = await prisma.gameUser.findUnique({ where: { id: userId } })
//         if (!user) throw new Error('User not found')

//         let newExp = user.experience + exp
//         let newLevel = user.level

//         // Check for level up
//         while (newLevel < this.levelExpRequirements.length &&
//             newExp >= this.levelExpRequirements[newLevel]) {
//             newExp -= this.levelExpRequirements[newLevel]
//             newLevel++
//         }

//         return prisma.gameUser.update({
//             where: { id: userId },
//             data: { level: newLevel, experience: newExp }
//         })
//     }

//     private static async updateAchievements(userId: string): Promise<void> {
//         const completedRaids = await prisma.dungeonRaid.count({
//             where: { userId, completed: true }
//         })

//         // Update dungeon completion achievement
//         await prisma.achievement.upsert({
//             where: {
//                 userId_type: { userId, type: 'dungeon_completions' }
//             },
//             update: {
//                 progress: completedRaids,
//                 completed: completedRaids >= 100 // Example: complete at 100 dungeons
//             },
//             create: {
//                 userId,
//                 type: 'dungeon_completions',
//                 progress: completedRaids
//             }
//         })
//     }

//     // Energy regeneration - call this when checking user energy
//     static async regenerateEnergy(userId: string): Promise<void> {
//         const user = await prisma.gameUser.findUnique({ where: { id: userId } })
//         if (!user) return

//         const now = new Date()
//         const minutesSinceRefill = Math.floor(
//             (now.getTime() - user.lastEnergyRefill.getTime()) / (60 * 1000)
//         )

//         if (minutesSinceRefill >= 5) { // Regenerate 1 energy every 5 minutes
//             const energyToAdd = Math.min(
//                 Math.floor(minutesSinceRefill / 5),
//                 100 - user.energy // Max energy is 100
//             )

//             if (energyToAdd > 0) {
//                 await prisma.gameUser.update({
//                     where: { id: userId },
//                     data: {
//                         energy: { increment: energyToAdd },
//                         lastEnergyRefill: now
//                     }
//                 })
//             }
//         }
//     }
// }

// interface Result {
//     success: boolean
//     error?: string
//     data?: any
// }