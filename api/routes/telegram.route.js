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
exports.testRoute = testRoute;
const express_1 = require("express");
const create_controller_1 = require("../controllers/create.controller");
const submission_controller_1 = require("../controllers/submission.controller");
function testRoute(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
const telegramRoute = (0, express_1.Router)();
//creeate task for user via payer
telegramRoute.post('/create', create_controller_1.handleCreateRequest);
//verify the task submitted by user
telegramRoute.post('/verify', submission_controller_1.handleVerifySubmission);
exports.default = telegramRoute;
// const TELEGRAM_BOT_USER_TOKEN = process.env.TELEGRAM_BOT_USER_TOKEN;
// const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_USER_TOKEN}`;
// telegramRoute.post('/test', async (req, res) => {
//     try {
//         const { message } = req.body;
//         if (message) {
//             const chatId = message.chat.id;
//             const receivedText = message.text;
//             // Process the received message and prepare response
//             const responseText = `Received your message: ${receivedText}`;
// try {
//     sendReplyUser(chatId,responseText)
// } catch (error) {
//     sendReplyUser(chatId, responseText)
// }
//           // Send response back to Telegram
//         }
//         res.sendStatus(200);
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         res.sendStatus(500);
//     }
// })
// export default telegramRoute;
