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
exports.handleCreateRequest = handleCreateRequest;
const types_1 = require("../types");
const url_validator_1 = require("../utils/url-validator");
const payer_service_1 = require("../services/payer.service");
const jwt_1 = require("../utils/jwt");
const telegram_service_1 = require("../services/telegram.service");
const telegram_service_2 = require("../services/telegram.service");
const chatbot_1 = require("../utils/chatbot");
const constant_1 = require("../config/constant");
const task_service_1 = require("../services/task.service");
const userStates = new Map();
function handleCreateRequest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { message, callback_query } = req.body;
            if (message && message.chat && message.text) {
                yield handleMessage(message);
            }
            if (callback_query) {
                yield handleCallbackQuery(callback_query);
            }
            res.status(200).json({
                success: true,
                message: "Update processed successfully"
            });
        }
        catch (error) {
            res.status(200).json({
                success: true,
                message: "Update processed successfully"
            });
            next(error);
        }
    });
}
function handleMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = message.chat.id;
        const text = message.text;
        if (text.startsWith('/')) {
            yield handleCommand(chatId, text);
        }
        else {
            yield handleUserInput(chatId, text);
        }
    });
}
function handleCommand(chatId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = text.slice(1);
        if (command === 'start') {
            userStates.set(chatId, { state: types_1.State.INITIAL });
            yield (0, telegram_service_2.sendMessage)(chatId, "Hi! Choose a Platform:", (0, telegram_service_1.getInitialKeyboard)());
        }
        else if (command === 'list') {
            yield handleListCommand(chatId);
        }
        else {
            yield (0, telegram_service_2.sendMessage)(chatId, "Unknown command.");
        }
    });
}
function handleUserInput(chatId, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const userState = userStates.get(chatId);
        if (userState && userState.state === types_1.State.URL_REQUIRED && userState.platformAction) {
            if ((0, url_validator_1.validateUrl)(text, userState.platformAction.platform)) {
                userState.url = text;
                userState.state = types_1.State.PRICING;
                userStates.set(chatId, userState);
                yield (0, telegram_service_2.sendMessage)(chatId, "URL validated. Choose a price:", (0, telegram_service_1.getPricingKeyboard)());
            }
            else {
                yield (0, telegram_service_2.sendMessage)(chatId, "Invalid URL. Please try again with a valid URL for the selected platform.");
            }
        }
    });
}
function handleCallbackQuery(callback_query) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = callback_query.message.chat.id;
        const messageId = callback_query.message.message_id;
        const data = callback_query.data;
        const first_name = callback_query.message.chat.first_name;
        const last_name = callback_query.message.chat.username;
        yield (0, telegram_service_2.editMessageReplyMarkup)(chatId, messageId);
        if (Object.values(types_1.Platform).includes(data)) {
            yield handlePlatformSelection(chatId, data);
        }
        else if (data.startsWith('price_')) {
            yield handlePriceSelection(chatId, data);
        }
        else if (data.includes('_')) {
            yield handleActionSelection(chatId, data);
        }
        else if (data === 'confirm' || data === 'cancel') {
            yield handleConfirmation(chatId, data, callback_query.message.chat, first_name, last_name);
        }
    });
}
function handlePlatformSelection(chatId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        userStates.set(chatId, {
            state: types_1.State.PLATFORM_SELECTED,
            platformAction: { platform, action: null }
        });
        yield (0, telegram_service_2.sendMessage)(chatId, `You chose ${platform}. Now select type:`, (0, telegram_service_1.getPlatformActionKeyboard)(platform));
    });
}
function handlePriceSelection(chatId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const userState = userStates.get(chatId);
        if (userState && userState.state === types_1.State.PRICING) {
            const price = parseInt(data.split('_')[1]);
            userState.price = price;
            userState.state = types_1.State.CONFIRMATION;
            userStates.set(chatId, userState);
            const confirmationMessage = `Please confirm your order:\n
Platform: ${((_a = userState.platformAction) === null || _a === void 0 ? void 0 : _a.platform) || ''}\n
Action: ${((_b = userState.platformAction) === null || _b === void 0 ? void 0 : _b.action) || ''}\n
URL: ${userState.url || ''}\n
Price: $${price}`;
            yield (0, telegram_service_2.sendMessage)(chatId, confirmationMessage, (0, telegram_service_1.getConfirmationKeyboard)());
        }
    });
}
function handleActionSelection(chatId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const [platform, action] = data.split('_');
        const userState = userStates.get(chatId);
        if (userState && userState.state === types_1.State.PLATFORM_SELECTED) {
            userState.platformAction = { platform, action };
            userState.state = types_1.State.URL_REQUIRED;
            userStates.set(chatId, userState);
            yield (0, telegram_service_2.sendMessage)(chatId, `Please enter the URL for ${platform} ${action}:`);
        }
    });
}
function handleConfirmation(chatId, data, chat, first_name, last_name) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const userState = userStates.get(chatId);
        if (userState && userState.state === types_1.State.CONFIRMATION) {
            if (data === 'confirm') {
                // Send a confirmation message with all order details
                try {
                    const creator = yield (0, payer_service_1.checkPayer)(chatId, first_name, last_name);
                    console.log(creator, "creator");
                    const payerId = creator.id;
                    const platform = (_a = userState.platformAction) === null || _a === void 0 ? void 0 : _a.platform;
                    const taskName = (_b = userState.platformAction) === null || _b === void 0 ? void 0 : _b.action;
                    const amount = userState.price;
                    const taskLink = userState.url;
                    const signature = "";
                    if (platform && taskName && amount && taskLink) {
                        const { token } = yield handleUserConfirmation(payerId, platform, taskName, amount, signature, taskLink);
                        yield (0, telegram_service_2.sendMessage)(chatId, `Order Saved. Kindly pay through below link \n Platform: ${(_c = userState.platformAction) === null || _c === void 0 ? void 0 : _c.platform}\n
                     
                       Action: ${(_d = userState.platformAction) === null || _d === void 0 ? void 0 : _d.action}\n
                       URL: ${userState.url}\n
                       Price: ${userState.price}SOL\n
                       Payment link:${constant_1.BASE_URL}?token=${token}`);
                    }
                }
                catch (error) {
                    yield (0, telegram_service_2.sendMessage)(chatId, "Order Creation failed!");
                }
            }
            else {
                // Send a cancellation message
                yield (0, telegram_service_2.sendMessage)(chatId, "Order cancelled. You can start over with the /start command.");
            }
            // Clear the user state after confirming or cancelling
            userStates.delete(chatId);
        }
    });
}
function handleListCommand(chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, telegram_service_2.sendMessage)(chatId, "Here are the list of Tasks: ");
        const userFound = yield (0, payer_service_1.checkPayerFound)(chatId);
        if (!userFound) {
            yield (0, telegram_service_2.sendMessage)(chatId, "User not found. ❌ ");
            return;
        }
        const taskList = yield (0, task_service_1.getTasksForPayer)(userFound.id);
        if (!taskList) {
            yield (0, telegram_service_2.sendMessage)(chatId, "Task not found. ❌ ");
            return;
        }
        taskList.map((x) => __awaiter(this, void 0, void 0, function* () {
            const taskMessage = `
*📌 Task Name*: ${(0, chatbot_1.escapeMarkdown)(x.task_name)}\n
*🖥️ Platform*: ${(0, chatbot_1.escapeMarkdown)(x.platform)}\n
*💰 Amount*: \ ${(0, chatbot_1.escapeMarkdown)(x.amount.toString())}SOL\n
*🔗 Link*: ${x.task_link ? `[Click here](${(0, chatbot_1.escapeMarkdown)(x.task_link)})` : 'No link provided'}\n
*💵 Payment*: ${x.signature ? '✅ Done' : '❌ Not done'}\n
*⏳ Status*: ${x.status === 'Hold' ? '⏸️ On Hold' : (0, chatbot_1.escapeMarkdown)(x.status)}
THIS IS TEST
    `.trim();
            yield (0, telegram_service_2.sendMessage)(chatId, taskMessage, { parse_mode: 'MarkdownV2' });
        }));
    });
}
function handleUserConfirmation(payerId, platform, taskName, amount, signature, taskLink, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // First, check if the payer exists
            const payer = yield (0, payer_service_1.findPayerById)(payerId);
            if (!payer) {
                throw new Error('Payer not found');
            }
            const endDate = new Date();
            const task = yield (0, task_service_1.createTask)(payerId, platform, taskName, amount, signature, taskLink, endDate, comment);
            console.log('Task created on user confirmation:', task);
            const token = yield (0, jwt_1.createPaymentToken)(payerId, task.id, amount);
            return { task, token };
        }
        catch (error) {
            console.error('Error handling user confirmation:', error);
            throw error;
        }
    });
}
