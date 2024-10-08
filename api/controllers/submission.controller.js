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
exports.handleVerifySubmission = handleVerifySubmission;
exports.usertaskSubmission = usertaskSubmission;
const image_service_1 = require("../services/image.service");
const user_service_1 = require("../services/user.service");
const proof_service_1 = require("../services/proof.service");
const telegram_service_1 = require("../services/telegram.service");
const user_middleware_1 = require("../middlewares/user.middleware");
const POINTS = 200;
function handleVerifySubmission(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate request body
            if (!req.body || typeof req.body !== 'object') {
                console.error('Invalid request body received:', req.body);
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body"
                });
            }
            const update = req.body;
            // Enhanced logging
            console.log('Received Telegram update:', JSON.stringify(update, null, 2));
            // Verify update_id exists
            if (!update.update_id) {
                console.warn('Received update without update_id:', update);
                return res.status(400).json({
                    success: false,
                    message: "Missing update_id"
                });
            }
            const { message } = update;
            if (message) {
                // Handle text messages
                if (message.text) {
                    yield handleUserMessage(message);
                }
                // Handle photo messages
                if (message.photo && message.photo.length > 0 && message.chat.id) {
                    yield image_service_1.ImageService.handleImage(message.chat.id, message.photo);
                }
            }
            res.status(200).json({
                success: true,
                message: "Update processed successfully"
            });
        }
        catch (error) {
            console.error('Error processing Telegram update:', error);
            res.status(200).json({
                success: false,
                message: "Error processed successfully"
            });
            // Pass error to error handling middleware
            // next(error);
        }
    });
}
function handleUserMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chatId = message.chat.id;
            const username = message.chat.username || 'unknown_user';
            const text = message.text;
            console.log(`Processing message from ${username} (${chatId}): ${text}`);
            if (text === null || text === void 0 ? void 0 : text.startsWith('/')) {
                yield handleUserCommand(chatId, text, username);
            }
        }
        catch (error) {
            console.error('Error in handleUserMessage:', error);
            throw error; // Re-throw to be caught by the main error handler
        }
    });
}
function handleUserCommand(chatId, text, username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const command = text.slice(1).toLowerCase();
            console.log(`Processing command '${command}' from user ${username}`);
            switch (command) {
                case 'start':
                    const welcomeMessage = `Hello @${username}\n\n😸 Welcome to *Social Hunt*\n\n💥 Complete tasks\n\n🎁 Get Rewarded with Solana tokens`;
                    yield (0, telegram_service_1.sendMessageUser)(chatId, welcomeMessage, {
                        parse_mode: 'Markdown'
                    });
                    break;
                default:
                    yield (0, telegram_service_1.sendMessageUser)(chatId, "Unknown command. Type /start to begin.");
            }
        }
        catch (error) {
            console.error(`Error handling command ${text} for user ${username}:`, error);
            // Try to notify user of error
            yield (0, telegram_service_1.sendMessageUser)(chatId, "Sorry, there was an error processing your command. Please try again later.").catch(console.error);
            throw error;
        }
    });
}
function usertaskSubmission(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const taskId = req.params.taskId;
        const userData = (0, user_middleware_1.getInitData)(res);
        const chatId = (_a = userData === null || userData === void 0 ? void 0 : userData.user) === null || _a === void 0 ? void 0 : _a.id;
        try {
            if (!chatId) {
                return res.status(400).json({ error: 'Chat ID is required.' });
            }
            const user = yield user_service_1.UserService.findUserByTelegramId(chatId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            yield proof_service_1.ProofService.deletePendingProof(user.id, chatId);
            const submission = yield proof_service_1.ProofService.createProof(chatId, user.id, taskId, POINTS);
            yield (0, telegram_service_1.sendMessageUser)(chatId, `Successfully created submission\nID: ${submission.id}\nPlease upload your proof.`);
            return res.status(201).json({ submissionId: submission.id });
        }
        catch (error) {
            console.error('Error in usertaskSubmission:', error);
            next(error);
        }
    });
}
