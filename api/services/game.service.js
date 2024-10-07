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
exports.gameAccInfo = gameAccInfo;
exports.createGameAccount = createGameAccount;
exports.getdungeonList = getdungeonList;
exports.getdungeonById = getdungeonById;
exports.createRaid = createRaid;
exports.getRaidById = getRaidById;
const client_1 = require("@prisma/client");
const __1 = require("..");
function gameAccInfo(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.gameAccount.findFirst({
            where: {
                userId: userId
            }
        });
    });
}
function createGameAccount(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const gameacc = yield __1.prisma.gameAccount.create({
            data: {
                userId: userId,
                knight_lvl: 1,
                knight_exp: 0,
                mage_lvl: 1,
                mage_exp: 0,
                beast_lvl: 1,
                beast_exp: 0,
            },
        });
        return gameacc;
    });
}
function getdungeonList(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.dungeon.findMany();
    });
}
function getdungeonById(dungeonId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.dungeon.findFirst({
            where: {
                id: dungeonId
            }
        });
    });
}
function createRaid(userId, gameId, entryTokens, dungeonId, endTime) {
    return __awaiter(this, void 0, void 0, function* () {
        yield __1.prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
            // Deduct tokens and energy
            yield prisma.user.update({
                where: { id: userId },
                data: {
                    points: { decrement: entryTokens },
                    // energy: { decrement: dungeon.energyCost }
                }
            });
            return yield prisma.dungeonRaid.create({
                data: {
                    status: client_1.RaidStatus.active,
                    gameId: gameId,
                    dungeonId,
                    endTime
                }
            });
        }));
    });
}
function getRaidById(dungeonId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.dungeonRaid.findFirst({
            where: {
                id: dungeonId
            }
        });
    });
}
// export async function getGameAccId(userId: string) {
//     return await prisma.gameAccount.findFirst({
//         where: {
//             userId:userId
//         }
//     })
// }
