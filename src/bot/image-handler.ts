import { createWorker, Worker } from "tesseract.js";
import { getImageUrl, sendMessage } from "../services/telegram.service";

import { prisma } from "..";
import { config, Config, PhotoSize } from "../types";
import { createImageBufferFromUrl, generateImageHash, isValidProof, processImage } from "../utils/chatbot";


// Main function
export const imageHandlerChat = async (chatId: number, photos: PhotoSize[]): Promise<void> => {
    console.log("IMAGE HANDLER FUNCTION");

    if (!chatId || !Array.isArray(photos) || photos.length === 0) {
        console.error("Invalid input parameters");
        await sendMessage(chatId, "Invalid request. Please try again with a valid image.");
        return;
    }

    await sendMessage(chatId, "Processing your image, please wait... 🔄");

    try {
        const fileId = photos[photos.length - 1].file_id;
        const imageUrl = await getImageUrl(fileId);

        if (!imageUrl) {
            throw new Error("Failed to get image URL");
        }
        const user = await prisma.user.findFirst({
            where: { telegram_id: chatId },

        });

        if (!user) {
            await sendMessage(chatId, "User not found. Please open the app first to create your account.");
            return;
        }
        const pending = await prisma.proof.findFirst({
            where: { userId: user.id, telegram_id: chatId }
        });

        if (!pending) {
            await sendMessage(chatId, "No pending submission found. Please create a submission first.");
            return;
        }
        const buffer = await createImageBufferFromUrl(imageUrl);

        const { text, confidence } = await processImage(buffer);
        console.log("text", text)
        if (!text || confidence < config.MIN_CONFIDENCE) {
            await sendMessage(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%). Please try uploading a clearer image.`);
            return;
        }

        console.log(`Extracted text (confidence ${confidence.toFixed(2)}%): ${text}`);

        if (!isValidProof(text)) {
            await sendMessage(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%). Please ensure the image contains relevant social media content.`);
            return;
        }
        const imageHash = await generateImageHash(buffer);
        console.log(`Image hash: ${imageHash}`);


        const alreadyImageUploaded = await prisma.submission.findFirst({
            where: { user_id: user.id, proof: imageHash }
        });

        if (alreadyImageUploaded) {
            await sendMessage(chatId, "Duplicate proof detected. Please submit a new, unique image.");
            return;
        }


        const alreadySub = await prisma.submission.findFirst({
            where: {
                user_id: pending.userId,
                task_id: pending.taskId,
                proof: imageHash,
            }
        })
        if (alreadySub) {
            await sendMessage(chatId, "Already submitted the image proof");
            return;
        }
        try {
            const result = await prisma.$transaction(async (prismaTx) => {
                const subTask = await prismaTx.submission.create({
                    data: {
                        user_id: pending.userId,
                        task_id: pending.taskId,
                        amount: pending.amount!,
                        proof: imageHash,
                    }
                });

                const updatedUser = await prismaTx.user.update({
                    where: { id: user.id },
                    data: { points: user.points + pending.amount! }
                });

                await prismaTx.proof.delete({
                    where: {
                        userId: user.id,
                        taskId: pending.taskId,
                        telegram_id: chatId
                    }
                });

                return { subTask, updatedUser };
            }, {
                maxWait: 5000,
                timeout: 10000,
            });

            console.log("Transaction result:", result);
            await sendMessage(chatId, `Congratulations! Your submission was successful. 🎉\nYou've earned ${pending.amount} points!`);
        } catch (transactionError) {
            console.error("Transaction error:", transactionError);
            await sendMessage(chatId, "An error occurred while processing your submission. Please try again later.");
        }
    } catch (error) {
        console.error("Error in imageHandlerChat:", error);
        await sendMessage(chatId, "An unexpected error occurred while processing your image. Please try again later.");
    }
};
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
