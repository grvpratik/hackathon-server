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
exports.userAuthentication = userAuthentication;
exports.userVerification = userVerification;
exports.userTaskList = userTaskList;
exports.userInfo = userInfo;
const user_service_1 = require("../services/user.service");
const task_service_1 = require("../services/task.service");
const user_middleware_1 = require("../middlewares/user.middleware");
const jwt_1 = require("../utils/jwt");
const game_service_1 = require("../services/game.service");
function userAuthentication(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const client = (0, user_middleware_1.getInitData)(res);
        // Ensure client data is valid
        if (!((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(400).json({ error: "Invalid client data" });
        }
        try {
            const user = yield user_service_1.UserService.checkOrCreateUser(client.user.id, client.user.firstName, client.user.username);
            const token = yield (0, jwt_1.createSessionToken)(user.id, user.telegram_id);
            if (!user.gameAccount) {
                yield (0, game_service_1.createGameAccount)(user.id);
            }
            return res.status(200).json({
                success: true,
                token,
            });
        }
        catch (error) {
            console.error("Error during session creation:", error);
            next(error);
        }
    });
}
function userVerification(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "need token"
            });
        }
        try {
            const payload = yield (0, jwt_1.verifySessionToken)(token);
            if (payload) {
                return res.status(200).json({
                    success: true,
                    message: "Verification successfully"
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Verification failed"
                });
            }
        }
        catch (error) {
            console.error("Error during session creation:", error);
            next(error);
        }
    });
}
function userTaskList(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Check if the platform is a string before using it
        let platformParam;
        // Check if it's a string or an array of strings
        if (typeof req.query.platform === 'string') {
            platformParam = req.query.platform;
        }
        const platform = platformParam;
        const userData = (0, user_middleware_1.getInitData)(res);
        const chatId = (_a = userData === null || userData === void 0 ? void 0 : userData.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!chatId) {
            res.status(404).json({ message: "Telegram user id not found" });
            return;
        }
        try {
            const user = yield user_service_1.UserService.findUserByTelegramId(chatId);
            if (!user) {
                res.status(404).json({ message: "user not found" });
                return;
            }
            console.log({ platform });
            const taskList = yield (0, task_service_1.getTasksForUser)(user.id, platform);
            res.status(200).json(taskList);
        }
        catch (error) {
            console.error("Error during session creation:", error);
            next(error);
        }
    });
}
function userInfo(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tgData = (0, user_middleware_1.getInitData)(res);
            const user = yield user_service_1.UserService.findUserByTelegramId(tgData === null || tgData === void 0 ? void 0 : tgData.user.id);
            if (!user) {
                res.status(500).json({ message: "User not found" });
            }
            res.status(200).json({
                user_id: user === null || user === void 0 ? void 0 : user.id,
                points: user === null || user === void 0 ? void 0 : user.points,
                address: user === null || user === void 0 ? void 0 : user.address
            });
        }
        catch (error) {
            console.error("Error getting user info:", error);
            next(error);
        }
    });
}
