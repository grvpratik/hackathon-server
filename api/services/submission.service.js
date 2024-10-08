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
exports.SubmissionService = void 0;
const __1 = require("..");
exports.SubmissionService = {
    isDuplicateSubmission(userId, imageHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield __1.prisma.submission.findFirst({
                where: { user_id: userId, proof: imageHash },
            });
            return !!submission;
        });
    },
    createSubmission(userId, pending, imageHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return __1.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                const subTask = yield prismaTx.submission.create({
                    data: {
                        user_id: userId,
                        task_id: pending.taskId,
                        amount: pending.amount,
                        proof: imageHash,
                    },
                });
                const updatedUser = yield prismaTx.user.update({
                    where: { id: userId },
                    data: { points: { increment: pending.amount } },
                });
                yield prismaTx.proof.delete({
                    where: {
                        userId,
                        taskId: pending.taskId,
                        telegram_id: pending.telegram_id,
                    },
                });
                return { subTask, updatedUser };
            }), {
                maxWait: 5000,
                timeout: 10000,
            });
        });
    }
};
