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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TELEGRAM_API_URL = exports.TELEGRAM_BOT_TOKEN = void 0;
exports.sendMessage = sendMessage;
exports.editMessageReplyMarkup = editMessageReplyMarkup;
exports.getImageUrl = getImageUrl;
const axios_1 = __importStar(require("axios"));
exports.TELEGRAM_BOT_TOKEN = "7041386853:AAEW5znTrN0WavEQPnOar-9puS98r5Zw_hU";
exports.TELEGRAM_API_URL = `https://api.telegram.org/bot${exports.TELEGRAM_BOT_TOKEN}`;
// console.log({ TELEGRAM_API_URL })
function sendMessage(chatId_1, text_1) {
    return __awaiter(this, arguments, void 0, function* (chatId, text, options = {}) {
        var _a;
        try {
            const response = yield axios_1.default.post(`${exports.TELEGRAM_API_URL}/sendMessage`, Object.assign({ chat_id: chatId, text }, options));
            return response.data;
        }
        catch (error) {
            console.error("SEND MESSAGE ERROR", error);
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error sending message to Telegram:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                if (error.code === 'ECONNABORTED') {
                    console.error('The request timed out');
                }
            }
            // throw error;
        }
    });
}
function editMessageReplyMarkup(chatId, messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.post(`${exports.TELEGRAM_API_URL}/editMessageReplyMarkup`, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                    inline_keyboard: [],
                },
            });
            return response.data;
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError) {
                console.error('Error editing message reply markup:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            throw error;
        }
    });
}
function getImageUrl(fileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileResponse = yield axios_1.default.post(`https://api.telegram.org/bot${exports.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
        if (fileResponse.status !== 200) {
            console.log("error while fetching image");
            return null;
        }
        const filePath = (yield fileResponse.data).result.file_path;
        if (filePath) {
            const imageUrl = `https://api.telegram.org/file/bot${exports.TELEGRAM_BOT_TOKEN}/${filePath}`;
            return imageUrl;
        }
        else {
            return null;
        }
    });
}
