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
exports.createTask = createTask;
exports.updateTaskStatus = updateTaskStatus;
exports.getTasksForPayer = getTasksForPayer;
exports.getPayerSignature = getPayerSignature;
exports.getTasksForUser = getTasksForUser;
const client_1 = require("@prisma/client");
const __1 = require("..");
//payer
function createTask(payerId, platform, taskName, amount, signature, taskLink, endDate, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.task.create({
            data: {
                platform,
                task_name: taskName,
                amount,
                signature,
                task_link: taskLink,
                comment,
                payer_id: payerId,
                status: client_1.TaskStatus.Hold,
                endDate
            }
        });
    });
}
function updateTaskStatus(taskId, signature) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.task.update({
            where: { id: taskId },
            data: {
                signature: signature,
                status: client_1.TaskStatus.Active,
            },
        });
    });
}
function getTasksForPayer(payerId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.task.findMany({
            where: { payer_id: payerId },
        });
    });
}
function getPayerSignature(signature) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.task.findMany({
            where: { signature },
        });
    });
}
function getTasksForUser(userId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield __1.prisma.task.findMany({
            where: {
                platform,
                NOT: {
                    submissions: {
                        some: {
                            user_id: userId
                        }
                    }
                },
                status: client_1.TaskStatus.Active
            }
        });
    });
}
