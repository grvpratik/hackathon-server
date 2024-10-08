import { NextFunction, Request, Response } from "express";
import { getInitData } from "../middlewares/user.middleware";


import { prisma } from "..";
import { RewardName } from "@prisma/client";
import { addExpToLvl, resetUnitForLegendary } from "../utils/game";
import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { FALLBACK_RPC_ENDPOINTS, RPC_ENDPOINT } from "../config/constant";
// Shared types between frontend and backend
export interface User {
    id: string;
    telegram_id: number;
    first_name?: string;
    last_name?: string;
    gameAccount?: GameAccount;
}
interface TokenMetadata {
    tokenName?: string;
    tokenSymbol?: string;
    tokenLogo?: string;
    price: number;
}

export interface GameAccount {
    id: string;
    userId: string;
    knight_lvl?: number | null;
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







export async function tokenMetaData(req: Request, res: Response) {
    const address = req.params.tokenId;
    console.log({ address })
    if (!address) {
        res.status(400).json({
            success: false,
            messsage: "token ca not found"
        })
        return
    }
    async function tryConnection(endpoint: string): Promise<Connection> {
        const connection = new Connection(endpoint);
        try {
            await connection.getSlot();
            return connection;
        } catch (error) {
            throw new Error(`Failed to connect to ${endpoint}`);
        }
    }

    async function getWorkingConnection(): Promise<Connection> {
        try {
            return await tryConnection(RPC_ENDPOINT);
        } catch (error) {
            for (const fallbackEndpoint of FALLBACK_RPC_ENDPOINTS) {
                try {
                    return await tryConnection(fallbackEndpoint);
                } catch { } // Intentionally empty, we'll try the next endpoint
            }
            throw new Error("All RPC endpoints failed");
        }
    }
    try {
        const connection = await getWorkingConnection();
        const metaplex = Metaplex.make(connection);
        const mintAddress = new PublicKey(address);

        let tokenMetadata: Partial<TokenMetadata> = {};

        try {
            const metadataAccount = metaplex.nfts().pdas().metadata({ mint: mintAddress });
            const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

            if (metadataAccountInfo) {
                const token = await metaplex.nfts().findByMint({ mintAddress });
                tokenMetadata = {
                    tokenName: token.name,
                    tokenSymbol: token.symbol,
                    tokenLogo: token.json?.image,
                };
            }
        } catch (error) {
            console.warn("Failed to fetch on-chain metadata:", error);
            // Continue execution to at least get the price
        }

        // Fetch price data
        const response = await axios.get(
            `https://price.jup.ag/v6/price?ids=${address}&vsToken=So11111111111111111111111111111111111111112`
        );
        const jupiterData = response.data.data;
        const price = jupiterData[address]?.price ?? 0;

        res.status(200).json({
            ...tokenMetadata,
            price,
        });
    } catch (error) {
        console.error("Failed to fetch token metadata:", error);
        res.status(500).json({
            success: false,
            message: "error getting token metadata"
        })
    }
}

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
        console.log(client)

        if (!client?.user?.id) {
            return res.status(400).json({ error: "Invalid client data" });
        }


        let user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(client?.user?.id) },
            include: { gameAccount: true }
        });
        console.log(user)
        if (user) {
            return res.json({
                success: true,
                data: user.gameAccount
            });
        } else {
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


    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

export async function gameDungeonList(req: Request, res: Response) {
    try {
        const dungeons = await prisma.dungeon.findMany({
            where: { isActive: true },
            include: {
                baseReward: true,
                silverReward: true,
                goldReward: true,
                diamondReward: true
            }
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

    const dungeonId = req.params.dungeonId;
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
        console.log({ user })
        if (!user!.gameAccount) {
            return res.status(400).json({ success: false, error: "Game account not found" });
        }
        const exRaid = await prisma.dungeonRaid.findFirst({
            where: {
                dungeonId: dungeonId,
                gameId: user?.gameAccount.id
            }
        })
        if (exRaid) {
            return res.status(400).json({ success: false, error: "raid already created" });
        }
        const dungeon = await prisma.dungeon.findUnique({
            where: { id: dungeonId }
        });
        console.log({ dungeon })
        if (!dungeon) {
            return res.status(400).json({ success: false, error: "Dungeon not found" });
        }

        // Check if user meets requirements
        if (user!.gameAccount.knight_lvl! < dungeon.minimumLevel) {
            return res.status(400).json({ success: false, error: "Level requirement not met" });
        }

        if (user!.points < dungeon.entryPoints) {
            return res.status(400).json({ success: false, error: "Not enough tokens" });
        }

        // Start raid
        const raid = await prisma.dungeonRaid.create({
            data: {

                gameId: user!.gameAccount.id,
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
            where: { id: user!.id },
            data: {
                points: user!.points - dungeon.entryPoints
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
        const raidId = req.params.raidId;
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
        const ca = dungeon.token_ca

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
        if (!baseReward || !silverReward || !goldReward || !diamondReward) {
            return res.status(500).json({ error: "Rewards configuration error" });
        }

        const rewardResult = await RewardSystem.determineReward(raid.game, raid.dungeon.id);

        // 3. Process reward based on tier
        let updatedGameData: any = {};

        if (rewardResult.rewardTier === RewardName.base) {
            //for mainnet reward
            const token = rewardResult.tokenAmount
            const BASE_EXP = 50
            const beastExp = addExpToLvl(gameAccount.beast_lvl!, gameAccount.beast_exp!, BASE_EXP)
            const knightExp = addExpToLvl(gameAccount.knight_lvl!, gameAccount.knight_exp!, BASE_EXP)
            const mageExp = addExpToLvl(gameAccount.mage_lvl!, gameAccount.mage_exp!, BASE_EXP)
            updatedGameData = await prisma.$transaction([
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
                        beast_exp: beastExp.newExp,
                        mage_lvl: mageExp.newLevel,
                        mage_exp: mageExp.newExp,

                    }
                })
            ]);

        }
        if (rewardResult.rewardTier === RewardName.silver) {

            updatedGameData = await prisma.$transaction([
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
                        knight_exp: 0,
                        beast_lvl: resetUnitForLegendary(gameAccount.beast_lvl!),
                        beast_exp: 0,
                        mage_lvl: resetUnitForLegendary(gameAccount.mage_lvl!),
                        mage_exp: 0
                    }
                })
            ]);
        }
        if (rewardResult.rewardTier === RewardName.gold) {

            updatedGameData = await prisma.$transaction([
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

            updatedGameData = await prisma.$transaction([
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

        res.status(200).json({ rewardResult })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}
