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
exports.PayerService = void 0;
exports.checkPayer = checkPayer;
exports.updatePayerWallet = updatePayerWallet;
exports.checkPayerFound = checkPayerFound;
exports.findPayerById = findPayerById;
const __1 = require("..");
function checkPayer(telegramId, firstName, lastName, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingPayer = yield __1.prisma.payer.findUnique({
            where: { telegram_id: telegramId },
        });
        if (existingPayer) {
            return existingPayer;
        }
        return yield __1.prisma.payer.create({
            data: {
                telegram_id: telegramId,
                first_name: firstName,
                Last_name: lastName,
                address: address,
            },
        });
    });
}
function updatePayerWallet(payerId, publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.payer.update({
            where: { id: payerId },
            data: { address: publicKey },
        });
    });
}
function checkPayerFound(telegramId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.payer.findFirst({
            where: {
                telegram_id: telegramId
            }
        });
    });
}
function findPayerById(payerId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.payer.findUnique({
            where: { id: payerId },
        });
    });
}
exports.PayerService = {
    checkOrCreatePayer(telegramId, firstName, lastName, address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prisma.payer.upsert({
                where: { telegram_id: telegramId },
                update: {},
                create: {
                    telegram_id: telegramId,
                    first_name: firstName,
                    Last_name: lastName,
                    address: address,
                },
            });
        });
    },
    updatePayerWallet(payerId, publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prisma.payer.update({
                where: { id: payerId },
                data: { address: publicKey },
            });
        });
    },
};
