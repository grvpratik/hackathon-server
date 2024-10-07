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
exports.UserService = void 0;
const __1 = require("..");
exports.UserService = {
    checkOrCreateUser(telegramId, firstName, lastName, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield __1.prisma.user.upsert({
                where: { telegram_id: telegramId },
                update: {},
                create: {
                    telegram_id: telegramId,
                    first_name: firstName !== null && firstName !== void 0 ? firstName : "",
                    last_name: lastName !== null && lastName !== void 0 ? lastName : "",
                },
                include: {
                    gameAccount: true
                }
            });
            return user;
        });
    },
    checkUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prisma.user.findFirst({
                where: {
                    id: userId
                }
            });
        });
    },
    findUserByTelegramId(telegramId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prisma.user.findFirst({
                where: { telegram_id: telegramId },
            });
        });
    },
    updateUserPoints(userId, points) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prisma.user.update({
                where: { id: userId },
                data: { points: { increment: points } },
            });
        });
    }
};
