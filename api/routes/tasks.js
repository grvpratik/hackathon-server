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
const express_1 = require("express");
const __1 = require("..");
const client_1 = require("@prisma/client");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.get("/", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userData = (0, middleware_1.getInitData)(res);
    const chatId = (_a = userData === null || userData === void 0 ? void 0 : userData.user) === null || _a === void 0 ? void 0 : _a.id;
    const user = yield __1.prisma.user.findFirst({
        where: {
            telegram_id: chatId
        }
    });
    if (!user) {
        res.status(404).json({ message: "user not found" });
        return;
    }
    const taskList = yield __1.prisma.task.findMany({
        where: {
            NOT: {
                submissions: {
                    some: {
                        user_id: user.id
                    }
                }
            },
            status: client_1.TaskStatus.Active
        }
    });
    res.status(200).json(taskList);
}));
router.get("/submit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskList = yield __1.prisma.task.findMany();
    res.status(200).json(taskList);
}));
exports.default = router;
