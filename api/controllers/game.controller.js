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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenMetaData = tokenMetaData;
exports.gameAccountInfo = gameAccountInfo;
exports.gameDungeonList = gameDungeonList;
exports.getActiveRaids = getActiveRaids;
exports.startDungeonRaid = startDungeonRaid;
exports.claimDungeonReward = claimDungeonReward;
const user_middleware_1 = require("../middlewares/user.middleware");
const __1 = require("..");
const client_1 = require("@prisma/client");
const game_1 = require("../utils/game");
const axios_1 = __importDefault(require("axios"));
const web3_js_1 = require("@solana/web3.js");
const js_1 = require("@metaplex-foundation/js");
const constant_1 = require("../config/constant");
function tokenMetaData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const address = req.params.tokenId;
        console.log({ address });
        if (!address) {
            res.status(400).json({
                success: false,
                messsage: "token ca not found"
            });
            return;
        }
        function tryConnection(endpoint) {
            return __awaiter(this, void 0, void 0, function* () {
                const connection = new web3_js_1.Connection(endpoint);
                try {
                    yield connection.getSlot();
                    return connection;
                }
                catch (error) {
                    throw new Error(`Failed to connect to ${endpoint}`);
                }
            });
        }
        function getWorkingConnection() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield tryConnection(constant_1.RPC_ENDPOINT);
                }
                catch (error) {
                    for (const fallbackEndpoint of constant_1.FALLBACK_RPC_ENDPOINTS) {
                        try {
                            return yield tryConnection(fallbackEndpoint);
                        }
                        catch (_a) { } // Intentionally empty, we'll try the next endpoint
                    }
                    throw new Error("All RPC endpoints failed");
                }
            });
        }
        try {
            const connection = yield getWorkingConnection();
            const metaplex = js_1.Metaplex.make(connection);
            const mintAddress = new web3_js_1.PublicKey(address);
            let tokenMetadata = {};
            try {
                const metadataAccount = metaplex.nfts().pdas().metadata({ mint: mintAddress });
                const metadataAccountInfo = yield connection.getAccountInfo(metadataAccount);
                if (metadataAccountInfo) {
                    const token = yield metaplex.nfts().findByMint({ mintAddress });
                    tokenMetadata = {
                        tokenName: token.name,
                        tokenSymbol: token.symbol,
                        tokenLogo: (_a = token.json) === null || _a === void 0 ? void 0 : _a.image,
                    };
                }
            }
            catch (error) {
                console.warn("Failed to fetch on-chain metadata:", error);
                // Continue execution to at least get the price
            }
            // Fetch price data
            const response = yield axios_1.default.get(`https://price.jup.ag/v6/price?ids=${address}&vsToken=So11111111111111111111111111111111111111112`);
            const jupiterData = response.data.data;
            const price = (_c = (_b = jupiterData[address]) === null || _b === void 0 ? void 0 : _b.price) !== null && _c !== void 0 ? _c : 0;
            res.status(200).json(Object.assign(Object.assign({}, tokenMetadata), { price }));
        }
        catch (error) {
            console.error("Failed to fetch token metadata:", error);
            res.status(500).json({
                success: false,
                message: "error getting token metadata"
            });
        }
    });
}
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
            // Check if user meets requirements
            if (user.gameAccount.knight_lvl < dungeon.minimumLevel) {
                return res.status(400).json({ success: false, error: "Level requirement not met" });
            }
            if (user.points < dungeon.entryPoints) {
                return res.status(400).json({ success: false, error: "Not enough tokens" });
            }
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
            const raidId = req.params.raidId;
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
            const ca = dungeon.token_ca;
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
            if (!baseReward || !silverReward || !goldReward || !diamondReward) {
                return res.status(500).json({ error: "Rewards configuration error" });
            }
            const rewardResult = yield RewardSystem.determineReward(raid.game, raid.dungeon.id);
            // 3. Process reward based on tier
            let updatedGameData = {};
            if (rewardResult.rewardTier === client_1.RewardName.base) {
                //for mainnet reward
                const token = rewardResult.tokenAmount;
                const BASE_EXP = 50;
                const beastExp = (0, game_1.addExpToLvl)(gameAccount.beast_lvl, gameAccount.beast_exp, BASE_EXP);
                const knightExp = (0, game_1.addExpToLvl)(gameAccount.knight_lvl, gameAccount.knight_exp, BASE_EXP);
                const mageExp = (0, game_1.addExpToLvl)(gameAccount.mage_lvl, gameAccount.mage_exp, BASE_EXP);
                updatedGameData = yield __1.prisma.$transaction([
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
                updatedGameData = yield __1.prisma.$transaction([
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
                            knight_exp: 0,
                            beast_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.beast_lvl),
                            beast_exp: 0,
                            mage_lvl: (0, game_1.resetUnitForLegendary)(gameAccount.mage_lvl),
                            mage_exp: 0
                        }
                    })
                ]);
            }
            if (rewardResult.rewardTier === client_1.RewardName.gold) {
                updatedGameData = yield __1.prisma.$transaction([
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
                updatedGameData = yield __1.prisma.$transaction([
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
            res.status(200).json({ rewardResult });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });
}
