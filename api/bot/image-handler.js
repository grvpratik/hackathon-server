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
const https_1 = __importDefault(require("https"));
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
            httpsAgent: new https_1.default.Agent({ rejectUnauthorized: true })
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
// import axios from 'axios';
// const TELEGRAM_API_URL = 'https://api.telegram.org/bot<YOUR_BOT_TOKEN>';
// async function sendMessageWithRetry(chatId: number, text: string, options = {}, retries = 3) {
//     for (let i = 0; i < retries; i++) {
//         try {
//             const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
//                 chat_id: chatId,
//                 text,
//                 ...options,
//             }, {
//                 timeout: 10000 // 10 seconds timeout
//             });
//             return response.data;
//         } catch (error) {
//             console.error(`SEND MESSAGE ERROR (Attempt ${i + 1}/${retries}):`, error);
//             if (i === retries - 1) {
//                 if (axios.isAxiosError(error)) {
//                     console.error('Error sending message to Telegram:', error.response?.data || error.message);
//                 }
//                 throw error;
//             }
//             // Wait for a bit before retrying
//             await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
//         }
//     }
// }
// export { sendMessageWithRetry as sendMessage };
//FOR GRAYSCALE PURPOSE
// const Tesseract = require('tesseract.js');
// const { createCanvas, loadImage } = require('canvas');
// const fs = require('fs');
// // Load your image from a URL or path
// const imagePath = 'path/to/your/image.png';
// async function preprocessAndExtractText(imagePath) {
//     try {
//         // Load the image into canvas
//         const image = await loadImage(imagePath);
//         const canvas = createCanvas(image.width, image.height);
//         const ctx = canvas.getContext('2d');
//         // Draw the image onto the canvas
//         ctx.drawImage(image, 0, 0, image.width, image.height);
//         // Apply grayscale filter
//         const imageData = ctx.getImageData(0, 0, image.width, image.height);
//         for (let i = 0; i < imageData.data.length; i += 4) {
//             const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
//             imageData.data[i] = avg;       // Red
//             imageData.data[i + 1] = avg;   // Green
//             imageData.data[i + 2] = avg;   // Blue
//         }
//         ctx.putImageData(imageData, 0, 0);
//         // Convert canvas to a buffer
//         const buffer = canvas.toBuffer('image/png');
//         // Perform OCR with Tesseract
//         const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
//         console.log(text);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }
// preprocessAndExtractText(imagePath);
// const axios = require('axios');
// const sharp = require('sharp');
// const Tesseract = require('tesseract.js');
// // Function to download image as buffer
// async function downloadImage(fileUrl) {
//     const response = await axios({
//         url: fileUrl,
//         method: 'GET',
//         responseType: 'arraybuffer' // Get image as buffer
//     });
//     return Buffer.from(response.data, 'binary');
// }
// // Function to convert image to grayscale in-memory
// async function convertToGrayscale(imageBuffer) {
//     return await sharp(imageBuffer)
//         .greyscale() // Convert to grayscale
//         .toBuffer(); // Return as buffer
// }
// // Function to perform OCR on the image buffer
// async function performOCR(imageBuffer) {
//     const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
//         logger: (m) => console.log(m)
//     });
//     console.log('Extracted Text:', text);
//     return text;
// }
// // Main function to process Telegram image
// async function processTelegramImage(fileUrl) {
//     try {
//         // Step 1: Download image as buffer
//         const imageBuffer = await downloadImage(fileUrl);
//         // Step 2: Convert to grayscale
//         const grayscaleBuffer = await convertToGrayscale(imageBuffer);
//         // Step 3: Perform OCR on the grayscale image buffer
//         const text = await performOCR(grayscaleBuffer);
//         // Analyze extracted text
//         const keywords = ["Follow", "Subscribe", "YouTube", "Like", "Comment"];
//         if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
//             console.log("Image contains social proof");
//         } else {
//             console.log("Random image");
//         }
//     } catch (error) {
//         console.error('Error processing image:', error);
//     }
// }
// // Example URL of Telegram file
// const telegramFileUrl = 'https://api.telegram.org/file/bot<your-bot-token>/<file_path>';
// processTelegramImage(telegramFileUrl);
