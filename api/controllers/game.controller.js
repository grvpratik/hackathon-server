"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameAccountInfo = gameAccountInfo;
exports.gameDungeonList = gameDungeonList;
exports.getActiveRaids = getActiveRaids;
exports.startDungeonRaid = startDungeonRaid;
exports.claimDungeonReward = claimDungeonReward;
const user_middleware_1 = require("../middlewares/user.middleware");
const __1 = require("..");
const client_1 = require("@prisma/client");
const game_1 = require("../utils/game");
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
    static calculateAverageLevel(gameAccount) {
        const knightLevel = gameAccount.knight_lvl || 1;
        const mageLevel = gameAccount.mage_lvl || 1;
        const beastLevel = gameAccount.beast_lvl || 1;
        return (knightLevel + mageLevel + beastLevel) / 3;
    }
    static determineReward(gameAccount, dungeonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dungeon = yield __1.prisma.dungeon.findUnique({
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
            let rewardTier;
            let tokenAmount;
            let exp;
            if (luck < normalizedDiamondThreshold) {
                rewardTier = client_1.RewardName.diamond;
                tokenAmount = dungeon.diamondReward.tokenAmount;
                exp = 200; // High exp for diamond reward
            }
            else if (luck < normalizedGoldThreshold) {
                rewardTier = client_1.RewardName.gold;
                tokenAmount = dungeon.goldReward.tokenAmount;
                exp = 150; // High exp for gold reward
            }
            else if (luck < normalizedSilverThreshold) {
                rewardTier = client_1.RewardName.silver;
                tokenAmount = dungeon.silverReward.tokenAmount;
                exp = 100; // Medium exp for silver reward
            }
            else {
                rewardTier = client_1.RewardName.base;
                tokenAmount = dungeon.baseReward.tokenAmount;
                exp = 50; // Base exp
            }
            return { rewardTier, tokenAmount, exp };
        });
    }
    static calculateTierChance(rewardTier, avgLevel) {
        return rewardTier.baseDropRate +
            (rewardTier.levelScalingFactor * avgLevel * this.LEVEL_FACTOR) +
            (Math.random() * this.BASE_LUCK_FACTOR);
    }
}
RewardSystem.BASE_LUCK_FACTOR = 0.5; // 50% luck
RewardSystem.LEVEL_FACTOR = 0.5; // 50% level-based
function gameAccountInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const client = (0, user_middleware_1.getInitData)(res);
            console.log(client);
            if (!((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id)) {
                return res.status(400).json({ error: "Invalid client data" });
            }
            let user = yield __1.prisma.user.findUnique({
                where: { telegram_id: BigInt((_b = client === null || client === void 0 ? void 0 : client.user) === null || _b === void 0 ? void 0 : _b.id) },
                include: { gameAccount: true }
            });
            console.log(user);
            if (user) {
                return res.json({
                    success: true,
                    data: user.gameAccount
                });
            }
            else {
                return res.json({
                    success: false,
                    message: "user not found "
                });
            }
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });
}
function gameDungeonList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dungeons = yield __1.prisma.dungeon.findMany({
                where: { isActive: true }
            });
            return res.json({
                success: true,
                data: dungeons
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });
}
function getActiveRaids(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const client = (0, user_middleware_1.getInitData)(res);
            // Ensure client data is valid
            if (!((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id)) {
                return res.status(400).json({ error: "Invalid client data" });
            }
            const user = yield __1.prisma.user.findUnique({
                where: { telegram_id: BigInt(client.user.id) },
                include: { gameAccount: true }
            });
            if (!(user === null || user === void 0 ? void 0 : user.gameAccount)) {
                return res.status(400).json({ success: false, error: "Game account not found" });
            }
            const activeRaids = yield __1.prisma.dungeonRaid.findMany({
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });
}
function startDungeonRaid(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const dungeonId = req.params.dungeonId;
        try {
            const client = (0, user_middleware_1.getInitData)(res);
            // Ensure client data is valid
            if (!((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id)) {
                return res.status(400).json({ error: "Invalid client data" });
            }
            const user = yield __1.prisma.user.findUnique({
                where: { telegram_id: BigInt(client.user.id) },
                include: { gameAccount: true }
            });
            console.log({ user });
            if (!user.gameAccount) {
                return res.status(400).json({ success: false, error: "Game account not found" });
            }
            const exRaid = yield __1.prisma.dungeonRaid.findFirst({
                where: {
                    dungeonId: dungeonId,
                    gameId: user === null || user === void 0 ? void 0 : user.gameAccount.id
                }
            });
            if (exRaid) {
                return res.status(400).json({ success: false, error: "raid already created" });
            }
            const dungeon = yield __1.prisma.dungeon.findUnique({
                where: { id: dungeonId }
            });
            console.log({ dungeon });
            if (!dungeon) {
                return res.status(400).json({ success: false, error: "Dungeon not found" });
            }
            // // Check if user meets requirements
            // if (user!.gameAccount.knight_lvl! < dungeon.minimumLevel) {
            //     return res.status(400).json({ success: false, error: "Level requirement not met" });
            // }
            // if (user!.points < dungeon.entryPoints) {
            //     return res.status(400).json({ success: false, error: "Not enough tokens" });
            // }
            // Start raid
            const raid = yield __1.prisma.dungeonRaid.create({
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
            yield __1.prisma.user.update({
                where: { id: user.id },
                data: {
                    points: user.points - dungeon.entryPoints
                }
            });
            return res.json({
                success: true,
                data: raid
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });
}
function claimDungeonReward(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { raidId } = req.body;
            const client = (0, user_middleware_1.getInitData)(res);
            // Ensure client data is valid
            if (!((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id)) {
                return res.status(400).json({ error: "Invalid client data" });
            }
            const raid = yield __1.prisma.dungeonRaid.findUnique({
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
            console.log({ avgLevel });
            // Fetch dungeon reward tiers
            const dungeon = raid.dungeon;
            const baseReward = yield __1.prisma.rewardTier.findUnique({
                where: { id: dungeon.baseRewardId },
            });
            const silverReward = yield __1.prisma.rewardTier.findUnique({
                where: { id: dungeon.silverRewardId },
            });
            const goldReward = yield __1.prisma.rewardTier.findUnique({
                where: { id: dungeon.goldRewardId },
            });
            const diamondReward = yield __1.prisma.rewardTier.findUnique({
                where: { id: dungeon.diamondRewardId },
            });
            if (!baseReward || !silverReward || !goldReward) {
                return res.status(500).json({ error: "Rewards configuration error" });
            }
            const rewardResult = yield RewardSystem.determineReward(raid.game, raid.dungeon.id);
            // 3. Process reward based on tier
            let updatedGameData = {};
            if (rewardResult.rewardTier === client_1.RewardName.base) {
                const BASE_EXP = 50;
                const beastExp = (0, game_1.addExpToLvl)(gameAccount.beast_lvl, gameAccount.beast_exp, BASE_EXP);
                const knightExp = (0, game_1.addExpToLvl)(gameAccount.knight_lvl, gameAccount.knight_exp, BASE_EXP);
                const mageExp = (0, game_1.addExpToLvl)(gameAccount.mage_lvl, gameAccount.mage_exp, BASE_EXP);
                const result = yield __1.prisma.$transaction([
                    __1.prisma.dungeonRaid.update({
                        where: { id: raidId },
                        data: {
                            status: 'claimed',
                            rewardTier: client_1.RewardName.base,
                        }
                    }),
                    __1.prisma.gameAccount.update({
                        where: { id: raid.gameId },
                        data: {
                            knight_lvl: knightExp.newLevel,
                            knight_exp: knightExp.newExp,
                            beast_lvl: beastExp.newLevel,
                            beast_exp: beastExp.newExp,
                            mage_lvl: mageExp.newLevel,
                            mage_exp: mageExp.newExp,
                        }
                    })
                ]);
            }
            if (rewardResult.rewardTier === client_1.RewardName.silver) {
                const result = yield __1.prisma.$transaction([
                    __1.prisma.dungeonRaid.update({
                        where: { id: raidId },
                        data: {
                            status: 'claimed',
                            rewardTier: client_1.RewardName.silver,
                        }
                    }),
                    __1.prisma.gameAccount.update({
                        where: { id: raid.gameId },
                        data: {
                            knight_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.knight_lvl),
                            knight_exp: 0, // Assuming knight_exp is the main experience field
                            beast_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.beast_lvl),
                            beast_exp: 0,
                            mage_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.mage_lvl),
                            mage_exp: 0
                        }
                    })
                ]);
            }
            if (rewardResult.rewardTier === client_1.RewardName.gold) {
                const result = yield __1.prisma.$transaction([
                    __1.prisma.dungeonRaid.update({
                        where: { id: raidId },
                        data: {
                            status: 'claimed',
                            rewardTier: client_1.RewardName.gold,
                        }
                    }),
                    __1.prisma.gameAccount.update({
                        where: { id: raid.gameId },
                        data: {
                            knight_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.knight_lvl),
                            knight_exp: 0,
                            beast_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.beast_lvl),
                            beast_exp: 0,
                            mage_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.mage_lvl),
                            mage_exp: 0
                        }
                    })
                ]);
            }
            if (rewardResult.rewardTier === client_1.RewardName.diamond) {
                const result = yield __1.prisma.$transaction([
                    __1.prisma.dungeonRaid.update({
                        where: { id: raidId },
                        data: {
                            status: 'claimed',
                            rewardTier: client_1.RewardName.diamond
                        }
                    }),
                    __1.prisma.gameAccount.update({
                        where: { id: raid.gameId },
                        data: {
                            knight_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.knight_lvl),
                            knight_exp: 0, // Assuming knight_exp is the main experience field
                            beast_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.beast_lvl),
                            beast_exp: 0,
                            mage_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.mage_lvl),
                            mage_exp: 0
                        }
                    })
                ]);
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });
}
