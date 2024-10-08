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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageHandlerChat = void 0;
const tesseract_js_1 = require("tesseract.js");
const bot_function_1 = require("./bot-function");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
const __1 = require("..");
// Configuration
const config = {
    KEYWORDS: ["posts", "following", "others", "followers", "Pinned", "Replies", "joined", "highlights", "Follow", "Subscribe", "YouTube", "Like", "Comment", "Twitter"],
    TESSERACT_LANG: "eng",
    MIN_CONFIDENCE: 70,
};
// Utility functions
const convertToGrayscale = (imageBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, sharp_1.default)(imageBuffer).greyscale().toBuffer();
});
const generateImageHash = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const resizedBuffer = yield (0, sharp_1.default)(buffer)
        .resize(8, 8, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer();
    return crypto_1.default.createHash('md5').update(resizedBuffer).digest('hex');
});
const createImageBufferFromUrl = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(imageUrl, {
            responseType: 'arraybuffer',
        });
        return (0, sharp_1.default)(Buffer.from(response.data)).toBuffer();
    }
    catch (error) {
        console.error('Error fetching or processing the image:', error);
        throw new Error('Failed to create image buffer from URL');
    }
});
const processImage = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const worker = yield (0, tesseract_js_1.createWorker)(config.TESSERACT_LANG);
    try {
        const grayscaleBuffer = yield convertToGrayscale(buffer);
        const { data } = yield worker.recognize(grayscaleBuffer);
        return { text: data.text, confidence: data.confidence };
    }
    finally {
        yield worker.terminate();
    }
});
const isValidProof = (text) => {
    return config.KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
};
// Main function
const imageHandlerChat = (chatId, photos) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("IMAGE HANDLER FUNCTION");
    if (!chatId || !Array.isArray(photos) || photos.length === 0) {
        console.error("Invalid input parameters");
        yield (0, bot_function_1.sendMessage)(chatId, "Invalid request. Please try again with a valid image.");
        return;
    }
    yield (0, bot_function_1.sendMessage)(chatId, "Processing your image, please wait... 🔄");
    try {
        const fileId = photos[photos.length - 1].file_id;
        const imageUrl = yield (0, bot_function_1.getImageUrl)(fileId);
        if (!imageUrl) {
            throw new Error("Failed to get image URL");
        }
        const buffer = yield createImageBufferFromUrl(imageUrl);
        const imageHash = yield generateImageHash(buffer);
        console.log(`Image hash: ${imageHash}`);
        const { text, confidence } = yield processImage(buffer);
        if (!text || confidence < config.MIN_CONFIDENCE) {
            yield (0, bot_function_1.sendMessage)(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%). Please try uploading a clearer image.`);
            return;
        }
        console.log(`Extracted text (confidence ${confidence.toFixed(2)}%): ${text}`);
        if (!isValidProof(text)) {
            yield (0, bot_function_1.sendMessage)(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%). Please ensure the image contains relevant social media content.`);
            return;
        }
        const user = yield __1.prisma.user.findFirst({
            where: { telegram_id: chatId },
            include: { submissions: true }
        });
        if (!user) {
            yield (0, bot_function_1.sendMessage)(chatId, "User not found. Please open the app first to create your account.");
            return;
        }
        const alreadyImageUploaded = yield __1.prisma.submission.findFirst({
            where: { user_id: user.id, proof: imageHash }
        });
        if (alreadyImageUploaded) {
            yield (0, bot_function_1.sendMessage)(chatId, "Duplicate proof detected. Please submit a new, unique image.");
            return;
        }
        const pending = yield __1.prisma.proof.findFirst({
            where: { userId: user.id, telegram_id: chatId }
        });
        if (!pending) {
            yield (0, bot_function_1.sendMessage)(chatId, "No pending submission found. Please create a submission first.");
            return;
        }
        const alreadySub = yield __1.prisma.submission.findFirst({
            where: {
                user_id: pending.userId,
                task_id: pending.taskId,
                proof: imageHash,
            }
        });
        if (alreadySub) {
            yield (0, bot_function_1.sendMessage)(chatId, "Already submitted the image proof");
            return;
        }
        try {
            const result = yield __1.prisma.$transaction((prismaTx) => __awaiter(void 0, void 0, void 0, function* () {
                const subTask = yield prismaTx.submission.create({
                    data: {
                        user_id: pending.userId,
                        task_id: pending.taskId,
                        amount: pending.amount,
                        proof: imageHash,
                    }
                });
                const updatedUser = yield prismaTx.user.update({
                    where: { id: user.id },
                    data: { points: user.points + pending.amount }
                });
                yield prismaTx.proof.delete({
                    where: {
                        userId: user.id,
                        taskId: pending.taskId,
                        telegram_id: chatId
                    }
                });
                return { subTask, updatedUser };
            }), {
                maxWait: 5000,
                timeout: 10000,
            });
            console.log("Transaction result:", result);
            yield (0, bot_function_1.sendMessage)(chatId, `Congratulations! Your submission was successful. 🎉\nYou've earned ${pending.amount} points!`);
        }
        catch (transactionError) {
            console.error("Transaction error:", transactionError);
            yield (0, bot_function_1.sendMessage)(chatId, "An error occurred while processing your submission. Please try again later.");
        }
    }
    catch (error) {
        console.error("Error in imageHandlerChat:", error);
        yield (0, bot_function_1.sendMessage)(chatId, "An unexpected error occurred while processing your image. Please try again later.");
    }
});
exports.imageHandlerChat = imageHandlerChat;
