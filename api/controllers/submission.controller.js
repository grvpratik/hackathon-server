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
            const body = req.body;
            console.log('Received Telegram update:', JSON.stringify(body, null, 2));
            const { message } = body;
            if (message && message.chat && message.text) {
                yield handleUserMessage(message);
            }
            // if (callback_query) {
            //     await handleCallbackQuery(callback_query);
            // }
            if (message.photo && message.chat.id) {
                image_service_1.ImageService.handleImage(message.chat.id, message.photo);
            }
        }
        catch (error) {
            console.error('Error processing Telegram update:', error);
            next(error);
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
            console.error('Error processing Telegram update:', error);
            next(error);
        }
    });
}
// Message handling
function handleUserMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = message.chat.id;
        const username = message.chat.username;
        const text = message.text;
        if (text === null || text === void 0 ? void 0 : text.startsWith('/')) {
            yield handleUserCommand(chatId, text, username || 'user');
        }
    });
}
// Command handling
const inlineKeyboard = {
    inline_keyboard: [
        // Row 1: Basic URL and callback buttons
        [
            { text: '🚀 Open App', url: "https://t.me/social_hunt_bot" },
            { text: '📋 View Tasks', callback_data: 'view_tasks' }
        ],
        // Row 2: Login and user profile
        [
            {
                text: '🔑 Login', login_url: {
                    url: 'https://your-domain.com/login',
                    forward_text: 'Login to Social Hunt',
                    bot_username: 'social_hunt_bot'
                }
            },
            {
                text: '👤 My Profile', web_app: {
                    url: 'https://your-domain.com/web-app'
                }
            }
        ],
        // Row 3: Share content and switch inline query
        [
            {
                text: '📢 Share App',
                switch_inline_query: 'Check out Social Hunt!'
            },
            {
                text: '🔍 Search Tasks',
                switch_inline_query_current_chat: 'task '
            }
        ],
        // Row 4: Game and pay options
        [
            {
                text: '🎮 Play Mini Game',
                callback_game: {} // The game short name will be set by the Bot API
            },
            {
                text: '💰 Buy Tokens',
                pay: true
            }
        ]
    ]
};
function handleUserCommand(chatId, text, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = text.slice(1);
        if (command === 'start') {
            const welcomeMessage = `Hello @${username}
        
                                😸 Welcome to *Social Hunt*

                                💥 Complete tasks

                                🎁 Get Rewarded with Solana tokens`;
            yield (0, telegram_service_1.sendMessageUser)(chatId, welcomeMessage, {
                parse_mode: 'MarkdownV2',
                reply_markup: inlineKeyboard
            });
        }
        else {
            yield (0, telegram_service_1.sendMessageUser)(chatId, "Unknown command.");
        }
    });
}
