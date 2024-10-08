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
exports.ImageService = void 0;
const types_1 = require("../types");
const chatbot_1 = require("../utils/chatbot");
const proof_service_1 = require("./proof.service");
const submission_service_1 = require("./submission.service");
const telegram_service_1 = require("./telegram.service");
const user_service_1 = require("./user.service");
exports.ImageService = {
    processImage(imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield (0, chatbot_1.createImageBufferFromUrl)(imageUrl);
            const { text, confidence } = yield (0, chatbot_1.processImage)(buffer);
            const imageHash = yield (0, chatbot_1.generateImageHash)(buffer);
            return { text, confidence, imageHash };
        });
    },
    isValidImage(text, confidence) {
        return !!text && confidence >= types_1.config.MIN_CONFIDENCE;
    },
    handleImage(chatId, photos) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("IMAGE HANDLER FUNCTION");
            if (!chatId || !Array.isArray(photos) || photos.length === 0) {
                console.error("Invalid input parameters");
                yield (0, telegram_service_1.sendMessageUser)(chatId, "Invalid request. Please try again with a valid image.");
                return;
            }
            yield (0, telegram_service_1.sendMessageUser)(chatId, "Processing your image, please wait... 🔄");
            try {
                const fileId = photos[photos.length - 1].file_id;
                const imageUrl = yield (0, telegram_service_1.getImageUrl)(fileId);
                if (!imageUrl) {
                    throw new Error("Failed to get image URL");
                }
                const user = yield user_service_1.UserService.findUserByTelegramId(chatId);
                if (!user) {
                    yield (0, telegram_service_1.sendMessageUser)(chatId, "User not found. Please open the app first to create your account.");
                    return;
                }
                const pending = yield proof_service_1.ProofService.findPendingProof(user.id, chatId);
                if (!pending) {
                    yield (0, telegram_service_1.sendMessageUser)(chatId, "No pending submission found. Please create a submission first.");
                    return;
                }
                const { text, confidence, imageHash } = yield exports.ImageService.processImage(imageUrl);
                if (!exports.ImageService.isValidImage(text, confidence)) {
                    yield (0, telegram_service_1.sendMessageUser)(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%). Please try uploading a clearer image.`);
                    return;
                }
                if (!(0, chatbot_1.isValidProof)(text)) {
                    yield (0, telegram_service_1.sendMessageUser)(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%). Please ensure the image contains relevant social media content.`);
                    return;
                }
                if (yield submission_service_1.SubmissionService.isDuplicateSubmission(user.id, imageHash)) {
                    yield (0, telegram_service_1.sendMessageUser)(chatId, "Duplicate proof detected. Please submit a new, unique image.");
                    return;
                }
                const result = yield submission_service_1.SubmissionService.createSubmission(user.id, pending, imageHash);
                console.log("Transaction result:", result);
                yield (0, telegram_service_1.sendMessageUser)(chatId, `Congratulations! Your submission was successful. 🎉\nYou've earned ${pending.amount} points!`);
            }
            catch (error) {
                console.error("Error in imageHandlerChat:", error);
                yield (0, telegram_service_1.sendMessageUser)(chatId, "An unexpected error occurred while processing your image. Please try again later.");
            }
        });
    }
};
