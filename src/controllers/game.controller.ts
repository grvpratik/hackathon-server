import { NextFunction, Request, Response } from "express";
import { getInitData } from "../middlewares/user.middleware";
import { UserService } from "../services/user.service";
import { createRaid, gameAccInfo, getdungeonById, getdungeonList, getRaidById } from "../services/game.service";
import { prisma } from "..";
import { RewardName } from "@prisma/client";
import { addExpToLvl, resetUnitForLegendary } from "../utils/game";
// Shared types between frontend and backend
export interface User {
    id: string;
    telegram_id: number;
    first_name?: string;
    last_name?: string;
    gameAccount?: GameAccount;
}

export interface GameAccount {
    id: string;
    userId: string;
    knight_lvl?: number |null;
    knight_exp?: number | null;
    mage_lvl?: number | null;
    mage_exp?: number | null;
    beast_lvl?: number | null;
    beast_exp?: number | null;
    
}

export interface Dungeon {
    id: string;
    name: string;
    description: string;
    entryTokens: number;
    timeToComplete: number; // in seconds
    minimumLevel: number;
    isActive: boolean;
    t1_token_amount?: bigint;
    t2_token_amount?: bigint;
    t3_token_amount?: bigint;
    t1_usd_amount?: bigint;
    t2_usd_amount?: bigint;
    t3_usd_amount?: bigint;
}

export interface DungeonRaid {
    id: string;
    gameId: string;
    dungeonId: string;
    startTime: Date;
    endTime: Date;
    completed: boolean;
    claimed: boolean;
    rewardTier?: 'base' | 'silver' | 'gold';
    experience?: number;
    tokenAmount?: number;
    status: 'active' | 'completed' | 'claimed';
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// export async function gameAccountInfo(req: Request, res: Response, next: NextFunction) {
//     // const client = getInitData(res);

//     // // Ensure client data is valid
//     // if (!client?.user?.id) {
//     //     return res.status(400).json({ error: "Invalid client data" });
//     // }
//     // const tg = client?.user?.id
//     // const user = await UserService.findUserByTelegramId(tg)
//     // // Ensure client data is valid
//     // if (!user) {
//     //     return res.status(400).json({ error: "user not found" });
//     // }
//     // const account = await gameAccInfo(user.id)
//     return res.status(200).json({
//         success: true,
//         data: {
//             id: "user123",
//             username: "DungeonMaster",
//             level: 5,
//             experience: 60,
//             energy: 80,
//             tokens: 100,
//             lastEnergyRefill: "2024-03-06T12:00:00Z"
//         }
//     });
// }

// export async function gameDungeonList(req: Request, res: Response, next: NextFunction) {

//     const dungeon = await getdungeonList();
//     return res.status(200).json({
//         success: true,
//         data: [
//             {
//                 id: "dungeon1",
//                 name: "Forest Cave",
//                 minimumLevel: 1,
//                 timeToComplete: 300,
//                 entryTokens: 10,
//                 energyCost: 20,
//                 goldReward: { tokenAmount: 30, experience: 100 },
//                 silverReward: { tokenAmount: 20, experience: 70 },
//                 baseReward: { tokenAmount: 10, experience: 50 }
//             },
//             {
//                 id: "dungeon2",
//                 name: "Dark Tower",
//                 minimumLevel: 3,
//                 timeToComplete: 600,
//                 entryTokens: 20,
//                 energyCost: 30,
//                 goldReward: { tokenAmount: 50, experience: 150 },
//                 silverReward: { tokenAmount: 35, experience: 100 },
//                 baseReward: { tokenAmount: 20, experience: 70 }
//             }
//         ]
//     });
// }


// export async function activeDungeonRaid(req: Request, res: Response, next: NextFunction) {
//     const userId = ""
//     //find dungeonraid where userid and active /completed/clain
//     res.json({
//         success: true,
//             data: [
//                 {
//                     id: "raid1",
//                     dungeon: {
//                         id: "dungeon1",
//                         name: "Forest Cave",
//                         timeToComplete: 300,
//                         entryTokens: 10,
//                         energyCost: 20
//                     },
//                     endTime: "2024-03-06T12:30:00Z"
//                 }
//             ]
//     })
// }



// export async function startDungeonRaid(req: Request, res: Response, next: NextFunction) {
//     const userId = ""
//     const gameacc = await gameAccInfo(userId)
//     const gameId = gameacc!.id
//     const dungeonId = "" //params or query
//     const dungeon = await getdungeonById(dungeonId)
//     //check level



//     const endTime = new Date(Date.now() + dungeon!.timeToComplete * 1000)

//     const raid = createRaid(userId, gameId, dungeon!.entryTokens, dungeonId, endTime)

//     res.json({
//         success: true,
//             data: {
//             id: "newraid123",
//                 dungeon: {
//                 id: "dungeon1",
//                     name: "Forest Cave",
//                         timeToComplete: 300,
//                             entryTokens: 10,
//                                 energyCost: 20
//             },
//             endTime: "2024-03-06T12:35:00Z"
//         }
//     })
// }

// export async function claimDungeonReward(req: Request, res: Response, next: NextFunction) {


//     // const raidId = ""
//     // const dungeonId = ""
//     // const gameId = ""


//     // const raid = await getRaidById(raidId);
//     // if (!raid || !raid.completed || raid.claimed) {
//     //     res.status(300).json({
//     //         success: false,
//     //         message:"Invalid raid or already claimed"
//     //     })
//     // }
//     // if (raid?.endTime) {

//     // }

//     // function resultWinner(params) {

//     // }

//     // if (top winner here) {
//     //     //assign exp and decrease lvl

//     // }
//     // if (top winner here) {
//     //     //assign exp and decrease lvl

//     // } if (base winner here) {
//     //     //assign exp and decrease lvl
//     //     //gain exp or lvl here

//     // }

//     // if (if token claimed here) {
//     //     //maybe send to his wallet 
//     // }

//     //logic check
//     //->check ended or not
//     //-> if time ended and status is active make result
//     //->assign exp and lvl based on reward type
//     //->assign status complete and genearate payout and assign claimed
//     //->










//     //         // Determine reward tier
//     //         const rewardTier = await this.determineRewardTier(raid.user.level, raid.dungeon)

//     //         // Calculate experience gain
//     //         const experience = raid.dungeon.baseExperience

//     //         await prisma.$transaction(async (prisma) => {
//     //             // Update user experience and possibly level
//     //             const updatedUser = await this.addExperience(raid.userId, experience)

//     //             // If user got top reward, reduce their level by half
//     //             if (rewardTier === 'gold') {
//     //                 await prisma.gameUser.update({
//     //                     where: { id: raid.userId },
//     //                     data: { level: Math.ceil(updatedUser.level / 2) }
//     //                 })
//     //             }

//     //             // Mark raid as claimed and record rewards
//     //             await prisma.dungeonRaid.update({
//     //                 where: { id: raidId },
//     //                 data: {
//     //                     claimed: true,
//     //                     rewardTier,
//     //                     experience,
//     //                     tokenAmount: this.getTokenAmount(raid.dungeon, rewardTier)
//     //                 }
//     //             })

//     //             // Update achievements
//     //             await this.updateAchievements(raid.userId)
//     //         })
//     res.json({
//         success: true,
//         data: {
//             rewardTier: 'gold',
//             tokenAmount: 30,
//             experience: 100
//         }
//     })


// }
class RewardSystem {
    private static BASE_LUCK_FACTOR = 0.5; // 50% luck
    private static LEVEL_FACTOR = 0.5; // 50% level-based

    static calculateAverageLevel(gameAccount: GameAccount): number {
        const knightLevel = gameAccount.knight_lvl || 1;
        const mageLevel = gameAccount.mage_lvl || 1;
        const beastLevel = gameAccount.beast_lvl || 1;
        return (knightLevel + mageLevel + beastLevel) / 3;
    }

    static async determineReward(gameAccount: GameAccount, dungeonId: string) {
        const dungeon = await prisma.dungeon.findUnique({
            where: { id: dungeonId },
            include: {
                baseReward: true,
                silverReward: true,
                goldReward: true,
                diamondReward: true,
            },
        });

        if (!dungeon) {
            throw new Error('Dungeon not found');
        }

        const avgLevel = this.calculateAverageLevel(gameAccount);
        const luck = Math.random();

        // Calculate chances for each reward tier
        const baseChance = this.calculateTierChance(dungeon.baseReward, avgLevel);
        const silverChance = this.calculateTierChance(dungeon.silverReward, avgLevel);
        const goldChance = this.calculateTierChance(dungeon.goldReward, avgLevel);
        const diamondChance = this.calculateTierChance(dungeon.diamondReward, avgLevel);

        // Normalize chances
        const totalChance = baseChance + silverChance + goldChance + diamondChance;
        const normalizedSilverThreshold = silverChance / totalChance;
        const normalizedGoldThreshold = (silverChance + goldChance) / totalChance;
        const normalizedDiamondThreshold = (silverChance + goldChance + diamondChance) / totalChance;

        // Determine reward tier
        let rewardTier: RewardName;
        let tokenAmount: number;
        let exp: number;

        if (luck < normalizedDiamondThreshold) {
            rewardTier = RewardName.diamond;
            tokenAmount = dungeon.diamondReward.tokenAmount;
            exp = 200; // High exp for diamond reward
        } else if (luck < normalizedGoldThreshold) {
            rewardTier = RewardName.gold;
            tokenAmount = dungeon.goldReward.tokenAmount;
            exp = 150; // High exp for gold reward
        } else if (luck < normalizedSilverThreshold) {
            rewardTier = RewardName.silver;
            tokenAmount = dungeon.silverReward.tokenAmount;
            exp = 100; // Medium exp for silver reward
        } else {
            rewardTier = RewardName.base;
            tokenAmount = dungeon.baseReward.tokenAmount;
            exp = 50; // Base exp
        }

        return { rewardTier, tokenAmount, exp };
    }

    private static calculateTierChance(
        rewardTier: { baseDropRate: number; levelScalingFactor: number },
        avgLevel: number
    ): number {
        return rewardTier.baseDropRate +
            (rewardTier.levelScalingFactor * avgLevel * this.LEVEL_FACTOR) +
            (Math.random() * this.BASE_LUCK_FACTOR);
    }
}

export async function gameAccountInfo(req: Request, res: Response) {
    try {
        const client = getInitData(res);

        // Ensure client data is valid
        if (!client?.user?.id) {
            return res.status(400).json({ error: "Invalid client data" });
        }


        let user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(!client?.user?.id) },
            include: { gameAccount: true }
        });

        // if (!user) {
        //     // Create new user and game account if doesn't exist
        //     user = await prisma.user.create({
        //         data: {
        //             telegram_id: BigInt(telegramUser.id),
        //             first_name: telegramUser.first_name,
        //             last_name: telegramUser.last_name,
        //             gameAccount: {
        //                 create: {
        //                     knight_lvl: 1,
        //                     knight_exp: 0,



        //                 }
        //             }
        //         },
        //         include: { gameAccount: true }
        //     });
        // }

        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function gameDungeonList(req: Request, res: Response) {
    try {
        const dungeons = await prisma.dungeon.findMany({
            where: { isActive: true }
        });

        return res.json({
            success: true,
            data: dungeons
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function getActiveRaids(req: Request, res: Response) {
    try {
        const client = getInitData(res);

        // Ensure client data is valid
        if (!client?.user?.id) {
            return res.status(400).json({ error: "Invalid client data" });
        }

        const user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(client.user.id) },
            include: { gameAccount: true }
        });

        if (!user?.gameAccount) {
            return res.status(400).json({ success: false, error: "Game account not found" });
        }

        const activeRaids = await prisma.dungeonRaid.findMany({
            where: {
                gameId: user.gameAccount.id,
                status: 'active'
            },
            include: {
                dungeon: true
            }
        });

        return res.json({
            success: true,
            data: activeRaids
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function startDungeonRaid(req: Request, res: Response) {
    try {
        const { dungeonId } = req.body;
        const client = getInitData(res);

        // Ensure client data is valid
        if (!client?.user?.id) {
            return res.status(400).json({ error: "Invalid client data" });
        }

        const user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(client.user.id) },
            include: { gameAccount: true }
        });

        if (!user?.gameAccount) {
            return res.status(400).json({ success: false, error: "Game account not found" });
        }

        const dungeon = await prisma.dungeon.findUnique({
            where: { id: dungeonId }
        });

        if (!dungeon) {
            return res.status(400).json({ success: false, error: "Dungeon not found" });
        }

        // Check if user meets requirements
        if (user.gameAccount.knight_lvl! < dungeon.minimumLevel) {
            return res.status(400).json({ success: false, error: "Level requirement not met" });
        }

        if (user.points < dungeon.entryPoints) {
            return res.status(400).json({ success: false, error: "Not enough tokens" });
        }

        // Start raid
        const raid = await prisma.dungeonRaid.create({
            data: {

                gameId: user.gameAccount.id,
                dungeonId: dungeon.id,
                endTime: new Date(Date.now() + dungeon.timeToComplete * 1000),
                status: 'active'
            },
            include: {
                dungeon: true
            }
        });

        // Deduct tokens
        await prisma.user.update({
            where: { id: user.id },
            data: {
                points: user.points - dungeon.entryPoints
            }
        });

        return res.json({
            success: true,
            data: raid
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function claimDungeonReward(req: Request, res: Response) {
    try {
        const { raidId } = req.body;
        const client = getInitData(res);

        // Ensure client data is valid
        if (!client?.user?.id) {
            return res.status(400).json({ error: "Invalid client data" });
        }

        const raid = await prisma.dungeonRaid.findUnique({
            where: { id: raidId },
            include: {
                dungeon: true,
                game: true
            }
        });

        if (!raid || raid.status !== 'active' || new Date() < raid.endTime) {
            return res.status(400).json({ success: false, error: "Raid cannot be claimed" });
        }

        const gameAccount = raid.game;

        // Calculate player's average level (knight, mage, beast)
        const avgLevel = ((gameAccount.knight_lvl || 1) + (gameAccount.mage_lvl || 1) + (gameAccount.beast_lvl || 1)) / 3;
        console.log({ avgLevel })
        // Fetch dungeon reward tiers
        const dungeon = raid.dungeon;

        const baseReward = await prisma.rewardTier.findUnique({
            where: { id: dungeon.baseRewardId },
        });
        const silverReward = await prisma.rewardTier.findUnique({
            where: { id: dungeon.silverRewardId },
        });
        const goldReward = await prisma.rewardTier.findUnique({
            where: { id: dungeon.goldRewardId },
        });
        const diamondReward = await prisma.rewardTier.findUnique({
            where: { id: dungeon.diamondRewardId },
        });
        if (!baseReward || !silverReward || !goldReward) {
            return res.status(500).json({ error: "Rewards configuration error" });
        }

        const rewardResult = await RewardSystem.determineReward(raid.game, raid.dungeon.id);

        // 3. Process reward based on tier
        let updatedGameData: any = {};

        if (rewardResult.rewardTier === RewardName.base) {
            const BASE_EXP = 50
            const beastExp = addExpToLvl(gameAccount.beast_lvl!, gameAccount.beast_exp!, BASE_EXP)
            const knightExp = addExpToLvl(gameAccount.knight_lvl!, gameAccount.knight_exp!, BASE_EXP)
            const mageExp = addExpToLvl(gameAccount.mage_lvl!, gameAccount.mage_exp!, BASE_EXP)
            const result = await prisma.$transaction([
                prisma.dungeonRaid.update({
                    where: { id: raidId },
                    data: {
                        status: 'claimed',
                        rewardTier: RewardName.base,
                    }
                }),
                prisma.gameAccount.update({
                    where: { id: raid.gameId },
                    data: {
                        knight_lvl: knightExp.newLevel,
                        knight_exp: knightExp.newExp,
                        beast_lvl: beastExp.newLevel,
                        beast_exp:beastExp.newExp,
                        mage_lvl: mageExp.newLevel,
                        mage_exp: mageExp.newExp,
                        
                    }
                })
            ]);
        }
        if (rewardResult.rewardTier === RewardName.silver) {

            const result = await prisma.$transaction([
                prisma.dungeonRaid.update({
                    where: { id: raidId },
                    data: {
                        status: 'claimed',
                        rewardTier: RewardName.silver,
                    }
                }),
                prisma.gameAccount.update({
                    where: { id: raid.gameId },
                    data: {
                        knight_lvl: resetUnitForLegendary(gameAccount.knight_lvl!),
                        knight_exp: 0,// Assuming knight_exp is the main experience field
                        beast_lvl: resetUnitForLegendary(gameAccount.beast_lvl!),
                        beast_exp: 0,
                        mage_lvl: resetUnitForLegendary(gameAccount.mage_lvl!),
                        mage_exp: 0
                    }
                })
            ]);
        }
        if (rewardResult.rewardTier === RewardName.gold) {

            const result = await prisma.$transaction([
                prisma.dungeonRaid.update({
                    where: { id: raidId },
                    data: {
                        status: 'claimed',
                        rewardTier: RewardName.gold,
                    }
                }),
                prisma.gameAccount.update({
                    where: { id: raid.gameId },
                    data: {
                        knight_lvl: resetUnitForLegendary(gameAccount.knight_lvl!),
                        knight_exp: 0,
                        beast_lvl: resetUnitForLegendary(gameAccount.beast_lvl!),
                        beast_exp: 0,
                        mage_lvl: resetUnitForLegendary(gameAccount.mage_lvl!),
                        mage_exp: 0
                    }
                })
            ]);
        }
        if (rewardResult.rewardTier === RewardName.diamond) {

            const result = await prisma.$transaction([
                prisma.dungeonRaid.update({
                    where: { id: raidId },
                    data: {
                        status: 'claimed',
                        rewardTier: RewardName.diamond
                    }
                }),
                prisma.gameAccount.update({
                    where: { id: raid.gameId },
                    data: {
                        knight_lvl: resetUnitForLegendary(gameAccount.knight_lvl!),
                        knight_exp: 0,// Assuming knight_exp is the main experience field
                        beast_lvl: resetUnitForLegendary(gameAccount.beast_lvl!),
                        beast_exp: 0,
                        mage_lvl: resetUnitForLegendary(gameAccount.mage_lvl!),
                        mage_exp: 0
                    }
                })
            ]);
        }



    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}
