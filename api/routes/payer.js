"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.secret = void 0;
const jose = __importStar(require("jose"));
const __1 = require("..");
const express_1 = require("express");
const client_1 = require("@prisma/client");
const middleware_1 = require("../middleware");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const web3_js_1 = require("@solana/web3.js");
const image_handler_1 = require("../bot/image-handler");
const bot_function_1 = require("../bot/bot-function");
const connection = new web3_js_1.Connection((_a = process.env.RPC_URL) !== null && _a !== void 0 ? _a : "https://api.devnet.solana.com");
const PARENT_WALLET_ADDRESS = "j1oAbxxiDUWvoHxEDhWE7THLjEkDQW2cSHYn2vttxTF";
const router = (0, express_1.Router)();
exports.secret = new TextEncoder().encode('cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2');
const BASE_URL = "https://twa-lake.vercel.app/payment";
function createPaymentToken(payerId, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const jwt = yield new jose.SignJWT({ payerId, taskId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')
            .sign(exports.secret);
        return jwt;
    });
}
///////////////////
// async function imageHandlerchat(chatId: any, photo: any) {
//     console.log("IMAGE HANDLER FUNCTION")
//     await sendMessage(chatId, "Image recieved");
// }
///////////////////////////////
const escapeMarkdown = (text) => {
    return text
        .replace(/_/g, "\\_")
        .replace(/\*/g, "\\*")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/~/g, "\\~")
        .replace(/`/g, "\\`")
        .replace(/>/g, "\\>")
        .replace(/#/g, "\\#")
        .replace(/\+/g, "\\+")
        .replace(/-/g, "\\-")
        .replace(/=/g, "\\=")
        .replace(/\|/g, "\\|")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\./g, "\\.")
        .replace(/!/g, "\\!");
};
// Define types and enums
var Platform;
(function (Platform) {
    Platform["YOUTUBE"] = "youtube";
    Platform["TWITTER"] = "twitter";
    Platform["DISCORD"] = "discord";
    Platform["TELEGRAM"] = "telegram";
})(Platform || (Platform = {}));
var Action;
(function (Action) {
    Action["SUBSCRIBE"] = "subscribe";
    Action["LIKE_COMMENT"] = "like_comment";
    Action["FOLLOW"] = "follow";
    Action["LIKE_RETWEET"] = "like_retweet";
    Action["JOIN"] = "join";
})(Action || (Action = {}));
var State;
(function (State) {
    State["INITIAL"] = "initial";
    State["PLATFORM_SELECTED"] = "platform_selected";
    State["ACTION_SELECTED"] = "action_selected";
    State["URL_REQUIRED"] = "url_required";
    State["PRICING"] = "pricing";
    State["CONFIRMATION"] = "confirmation";
})(State || (State = {}));
function checkPayer(telegramId, firstName, lastName, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the payer already exists
            const existingPayer = yield __1.prisma.payer.findUnique({
                where: {
                    telegram_id: telegramId,
                },
            });
            // If payer exists, return the existing payer
            if (existingPayer) {
                console.log('Payer found:', existingPayer);
                return existingPayer;
            }
            // If payer does not exist, create a new one
            const newPayer = yield __1.prisma.payer.create({
                data: {
                    telegram_id: telegramId,
                    first_name: firstName,
                    Last_name: lastName,
                    address: address,
                },
            });
            console.log('Payer created:', newPayer);
            return newPayer;
        }
        catch (error) {
            console.error('Error in checkPayer function:', error);
            throw error;
        }
    });
}
// Function to create a new task
function createTask(payerId, platform, taskName, amount, signature, taskLink, endDate, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const task = yield __1.prisma.task.create({
                data: {
                    platform,
                    task_name: taskName,
                    amount,
                    signature,
                    task_link: taskLink,
                    comment,
                    payer_id: payerId,
                    status: client_1.TaskStatus.Hold,
                    endDate // Set the initial status to Active
                },
            });
            console.log('Task created:', task);
            return task;
        }
        catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    });
}
// Function to handle user confirmation and create a task
function handleUserConfirmation(payerId, platform, taskName, amount, signature, taskLink, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // First, check if the payer exists
            const payer = yield __1.prisma.payer.findUnique({
                where: { id: payerId },
            });
            if (!payer) {
                throw new Error('Payer not found');
            }
            const endDate = new Date();
            const task = yield createTask(payerId, platform, taskName, amount, signature, taskLink, endDate, comment);
            console.log('Task created on user confirmation:', task);
            const token = yield createPaymentToken(payerId, task.id);
            return { task, token };
        }
        catch (error) {
            console.error('Error handling user confirmation:', error);
            throw error;
        }
    });
}
// In-memory store for user states (replace with a database in production)
const userStates = new Map();
// Helper functions
function getInitialKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Youtube 🎥', callback_data: Platform.YOUTUBE }],
                [{ text: 'X (twitter) 🐦', callback_data: Platform.TWITTER }],
                [{ text: 'Discord 💬', callback_data: Platform.DISCORD }],
                [{ text: 'Telegram 📩', callback_data: Platform.TELEGRAM }],
            ],
        },
    };
}
function getListKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [],
        },
    };
}
function getPlatformActionKeyboard(platform) {
    switch (platform) {
        case Platform.YOUTUBE:
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Subscribe', callback_data: `${platform}_${Action.SUBSCRIBE}` }],
                        [{ text: 'Like & comment', callback_data: `${platform}_${Action.LIKE_COMMENT}` }],
                    ],
                },
            };
        case Platform.TWITTER:
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Follow', callback_data: `${platform}_${Action.FOLLOW}` }],
                        [{ text: 'Like & retweet', callback_data: `${platform}_${Action.LIKE_RETWEET}` }],
                    ],
                },
            };
        case Platform.DISCORD:
        case Platform.TELEGRAM:
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Join', callback_data: `${platform}_${Action.JOIN}` }],
                    ],
                },
            };
    }
}
function getPricingKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '$50', callback_data: 'price_50' }],
                [{ text: '$100', callback_data: 'price_100' }],
            ],
        },
    };
}
function getConfirmationKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Confirm', callback_data: 'confirm' }],
                [{ text: 'Cancel', callback_data: 'cancel' }],
            ],
        },
    };
}
function validateUrl(url, platform) {
    const platformDomains = {
        [Platform.YOUTUBE]: 'youtube.com',
        [Platform.TWITTER]: 'twitter.com',
        [Platform.DISCORD]: 'discord.gg',
        [Platform.TELEGRAM]: 't.me',
    };
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.includes(platformDomains[platform]);
    }
    catch (_a) {
        return false;
    }
}
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    console.log("start");
    try {
        const body = req.body;
        console.log('Received Telegram update:', JSON.stringify(body, null, 2));
        const { message, callback_query } = body;
        if (message.photo && message.chat.id) {
            (0, image_handler_1.imageHandlerChat)(message.chat.id, message.photo);
        }
        if (message && message.chat && message.text) {
            const chatId = message.chat.id;
            const text = message.text;
            if (text.startsWith('/')) {
                const command = text.slice(1);
                if (command === 'start') {
                    userStates.set(chatId, { state: State.INITIAL });
                    yield (0, bot_function_1.sendMessage)(chatId, "Hi! Choose a Platform:", getInitialKeyboard());
                }
                else if (command === 'list') {
                    yield (0, bot_function_1.sendMessage)(chatId, "Here are the list of Tasks: ");
                    const userFound = yield __1.prisma.payer.findUnique({
                        where: {
                            telegram_id: chatId
                        }
                    });
                    if (!userFound) {
                        yield (0, bot_function_1.sendMessage)(chatId, "User not found. ❌ ");
                    }
                    const taskList = yield __1.prisma.task.findMany({
                        where: {
                            payer_id: userFound === null || userFound === void 0 ? void 0 : userFound.id
                        }
                    });
                    if (!taskList) {
                        yield (0, bot_function_1.sendMessage)(chatId, "Task not found. ❌ ");
                    }
                    taskList.map((x) => __awaiter(void 0, void 0, void 0, function* () {
                        const taskMessage = `
*📌 Task Name*: ${escapeMarkdown(x.task_name)}\n
*🖥️ Platform*: ${escapeMarkdown(x.platform)}\n
*💰 Amount*: \$${escapeMarkdown(x.amount.toString())}\n
*🔗 Link*: ${x.task_link ? `[Click here](${escapeMarkdown(x.task_link)})` : 'No link provided'}\n
*💵 Payment*: ${x.signature ? '✅ Done' : '❌ Not done'}\n
*⏳ Status*: ${x.status === 'Hold' ? '⏸️ On Hold' : escapeMarkdown(x.status)}
THIS IS TEST
    `.trim();
                        yield (0, bot_function_1.sendMessage)(chatId, taskMessage, { parse_mode: 'MarkdownV2' });
                    }));
                }
                else {
                    yield (0, bot_function_1.sendMessage)(chatId, "Unknown command.");
                }
            }
            else {
                try {
                    const userState = userStates.get(chatId);
                    if (userState && userState.state === State.URL_REQUIRED && userState.platformAction) {
                        console.log("inside validation");
                        if (validateUrl(text, userState.platformAction.platform)) {
                            console.log("validate url", userState);
                            userState.url = text;
                            userState.state = State.PRICING;
                            userStates.set(chatId, userState);
                            yield (0, bot_function_1.sendMessage)(chatId, "URL validated. Choose a price:", getPricingKeyboard());
                        }
                        else {
                            yield (0, bot_function_1.sendMessage)(chatId, "Invalid URL. Please try again with a valid URL for the selected platform.");
                        }
                    }
                }
                catch (error) {
                    console.error(error);
                    yield (0, bot_function_1.sendMessage)(chatId, "Error occured while processing url try again");
                }
            }
        }
        if (callback_query) {
            console.log(callback_query.chat);
            // Extract relevant information from the callback query
            const chatId = callback_query.message.chat.id;
            const messageId = callback_query.message.message_id;
            const data = callback_query.data;
            const first_name = callback_query.message.chat.first_name;
            const last_name = callback_query.message.chat.username;
            // Remove the inline keyboard from the previous message
            yield (0, bot_function_1.editMessageReplyMarkup)(chatId, messageId);
            console.log("data inside callback_query", data);
            // Handle platform selection
            if (Object.values(Platform).includes(data)) {
                // Set the user state to platform selected and store the chosen platform
                userStates.set(chatId, {
                    state: State.PLATFORM_SELECTED,
                    platformAction: { platform: data, action: null }
                });
                // Send a message asking the user to select an action for the chosen platform
                yield (0, bot_function_1.sendMessage)(chatId, `You chose ${data}. Now select type:`, getPlatformActionKeyboard(data));
            }
            // Handle price selection
            else if (data.startsWith('price_')) {
                console.log("price");
                const userState = userStates.get(chatId);
                console.log("price with", userState === null || userState === void 0 ? void 0 : userState.state);
                if (userState && userState.state === State.PRICING) {
                    // Extract the price from the callback data
                    const price = parseInt(data.split('_')[1]);
                    // Update the user state with the selected price and move to confirmation state
                    userState.price = price;
                    userState.state = State.CONFIRMATION;
                    userStates.set(chatId, userState);
                    // Prepare and send a confirmation message with order details
                    const confirmationMessage = `Please confirm your order:\n
Platform: ${escapeMarkdown(((_a = userState.platformAction) === null || _a === void 0 ? void 0 : _a.platform) || '')}\n
Action: ${escapeMarkdown(((_b = userState.platformAction) === null || _b === void 0 ? void 0 : _b.action) || '')}\n
URL: ${escapeMarkdown(userState.url || '')}\n
Price: \$${escapeMarkdown(price.toString())}`;
                    yield (0, bot_function_1.sendMessage)(chatId, confirmationMessage, getConfirmationKeyboard());
                }
            }
            // Handle action selection for a platform
            else if (data.includes('_')) {
                // Split the data into platform and action
                console.log("_ check");
                const [platform, action] = data.split('_');
                const userState = userStates.get(chatId);
                if (userState && userState.state === State.PLATFORM_SELECTED) {
                    // Update the user state with the selected action and move to URL input state
                    userState.platformAction = { platform, action };
                    userState.state = State.URL_REQUIRED;
                    userStates.set(chatId, userState);
                    // Prompt the user to enter a URL for the chosen platform and action
                    yield (0, bot_function_1.sendMessage)(chatId, `Please enter the URL for ${platform} ${action}:`);
                }
            }
            // Handle order confirmation or cancellation
            else if (data === 'confirm' || data === 'cancel') {
                const userState = userStates.get(chatId);
                if (userState && userState.state === State.CONFIRMATION) {
                    if (data === 'confirm') {
                        // Send a confirmation message with all order details
                        try {
                            const creator = yield checkPayer(chatId, first_name, last_name);
                            console.log(creator, "creator");
                            const payerId = creator.id;
                            const platform = (_c = userState.platformAction) === null || _c === void 0 ? void 0 : _c.platform;
                            const taskName = (_d = userState.platformAction) === null || _d === void 0 ? void 0 : _d.action;
                            const amount = userState.price;
                            const taskLink = userState.url;
                            const signature = "";
                            if (platform && taskName && amount && taskLink) {
                                const { token } = yield handleUserConfirmation(payerId, platform, taskName, amount, signature, taskLink);
                                yield (0, bot_function_1.sendMessage)(chatId, `Order Saved. Kindly pay through below link \n Platform: ${(_e = userState.platformAction) === null || _e === void 0 ? void 0 : _e.platform}\n
                     
                       Action: ${(_f = userState.platformAction) === null || _f === void 0 ? void 0 : _f.action}\n
                       URL: ${userState.url}\n
                       Price: $${userState.price}\n
                       Payment link:${BASE_URL}?token=${token}`);
                            }
                        }
                        catch (error) {
                            yield (0, bot_function_1.sendMessage)(chatId, "Order Creation failed!");
                        }
                    }
                    else {
                        // Send a cancellation message
                        yield (0, bot_function_1.sendMessage)(chatId, "Order cancelled. You can start over with the /start command.");
                    }
                    // Clear the user state after confirming or cancelling
                    userStates.delete(chatId);
                }
            }
        }
        res.status(200).json({ status: 'ok' });
    }
    catch (error) {
        console.error('Error processing Telegram update:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
router.get("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const list = yield __1.prisma.task.findMany({
        where: {}
    });
    res.status(200).json(list);
}));
router.post("/wallet", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const payerId = req.payerId;
    // @ts-ignore
    console.log(req.payerId);
    // Check if payerId is defined
    if (!payerId) {
        return res.status(400).json({ message: "Payer ID is required" });
    }
    try {
        const { signature, publicKey } = req.body;
        console.log({ signature, publicKey });
        const message = new TextEncoder().encode("Sign into mechanical turks");
        const result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(signature.data), new web3_js_1.PublicKey(publicKey).toBytes());
        console.log({ result });
        if (!result) {
            return res.status(411).json({
                message: "Incorrect signature",
            });
        }
        const payer = yield __1.prisma.payer.findFirst({
            where: {
                id: payerId,
            },
        });
        console.log({ payer });
        try {
            const updated = yield __1.prisma.payer.update({
                where: {
                    id: payerId,
                },
                data: {
                    address: publicKey,
                },
            });
            console.log({ updated });
            // Send success response here
            return res.status(200).json({ message: "Success" });
        }
        catch (error) {
            console.error(error);
            // Send wallet update failed response if error occurs
            return res.status(403).json({ message: "Wallet update failed" });
        }
    }
    catch (error) {
        // Send failure response for adding wallet address
        return res.status(403).json({ message: "Failed adding wallet address" });
    }
}));
router.post("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        // Extract taskId and userId from req object (set in authMiddleware)
        // @ts-ignore
        const taskId = req.taskId;
        // @ts-ignore
        const userId = req.userId;
        const { signature } = req.body;
        // Early check for missing signature
        if (!signature) {
            return res.status(403).json({ message: "Signature missing" });
        }
        // Fetch the user based on userId
        const user = yield __1.prisma.payer.findFirst({
            where: { id: userId }
        });
        // Early return if user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch the transaction from the Solana network
        const transaction = yield connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 1
        });
        // Early return if the transaction is null
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        console.log(transaction);
        // Check if the amount transferred matches 0.1 SOL (100000000 lamports)
        const transferredAmount = ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _a === void 0 ? void 0 : _a.postBalances[1]) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _c === void 0 ? void 0 : _c.preBalances[1]) !== null && _d !== void 0 ? _d : 0);
        if (transferredAmount !== 100000000) {
            return res.status(411).json({ message: "Transaction signature/amount incorrect" });
        }
        // Check if the recipient is the correct parent wallet address
        const recipientAddress = (_e = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(1)) === null || _e === void 0 ? void 0 : _e.toString();
        if (recipientAddress !== PARENT_WALLET_ADDRESS) {
            return res.status(411).json({ message: "Transaction sent to wrong address" });
        }
        // Check if the sender matches the user's wallet address
        const senderAddress = (_f = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(0)) === null || _f === void 0 ? void 0 : _f.toString();
        if (senderAddress !== user.address) {
            return res.status(411).json({ message: "Transaction sent from wrong address" });
        }
        // Update task status and store the transaction signature in the database
        const duplicateSignature = yield __1.prisma.task.findFirst({
            where: { signature: signature, },
        });
        if (duplicateSignature) {
            return res.status(302).json({ message: "No Duplicate transation" });
        }
        const taskStatus = yield __1.prisma.task.update({
            where: { id: taskId },
            data: {
                signature: signature,
                status: client_1.TaskStatus.Active, // Assuming "ACTIVE" is the correct status in your schema
            },
        });
        console.log({ taskStatus });
        // Return success response
        return res.status(200).json({ message: "Transaction added successfully", taskStatus });
    }
    catch (error) {
        console.error("Error processing task:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
