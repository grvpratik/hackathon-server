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
exports.ProofService = void 0;
const __1 = require("..");
exports.ProofService = {
    findPendingProof(userId, telegramId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prisma.proof.findFirst({
                where: { userId, telegram_id: telegramId },
            });
        });
    },
    deletePendingProof(userId, telegramId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prisma.proof.deleteMany({
                where: { userId, telegram_id: telegramId },
            });
        });
    },
    deleteProof(userId, taskId, telegramId) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prisma.proof.delete({
                where: {
                    userId,
                    taskId,
                    telegram_id: telegramId,
                },
            });
        });
    }, createProof(chatId, userId, taskId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prisma.proof.create({
                data: {
                    telegram_id: chatId,
                    userId,
                    taskId,
                    amount,
                }
            });
        });
    }
};
