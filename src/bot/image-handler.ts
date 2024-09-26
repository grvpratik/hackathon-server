import { createWorker, Worker } from "tesseract.js";
import { getImageUrl, sendMessage } from "./bot-function";
import axios, { AxiosResponse } from "axios";
import sharp from "sharp";
import crypto from 'crypto';
import https from 'https';
import { prisma } from "..";
import { appendFile } from "fs";
// prisma.$transaction(
//     async (prisma) => {
//         // Code running in a transaction...
//     },
//     {
//         maxWait: 5000, // default: 2000
//         timeout: 10000, // default: 5000
//     }
// );

// Define types
type PhotoSize = {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
};

type Config = {
    KEYWORDS: string[];
    TESSERACT_LANG: string;
    MIN_CONFIDENCE: number;
};

// Mock config (replace with actual config in production)
const config: Config = {
    KEYWORDS: ["Follow", "Subscribe", "YouTube", "Like", "Comment", "Twitter"],
    TESSERACT_LANG: "eng",
    MIN_CONFIDENCE: 70,
};

// Utility functions
const convertToGrayscale = async (imageBuffer: Buffer): Promise<Buffer> => {
    return sharp(imageBuffer).greyscale().toBuffer();
};

const generateImageHash = async (buffer: Buffer): Promise<string> => {
    const resizedBuffer = await sharp(buffer)
        .resize(8, 8, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer();

    return crypto.createHash('md5').update(resizedBuffer).digest('hex');
};

const createImageBufferFromUrl = async (imageUrl: string): Promise<Buffer> => {
    try {
        const response: AxiosResponse<ArrayBuffer> = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            httpsAgent: new https.Agent({ rejectUnauthorized: true })
        });
        return sharp(Buffer.from(response.data)).toBuffer();
    } catch (error) {
        console.error('Error fetching or processing the image:', error);
        throw new Error('Failed to create image buffer from URL');
    }
};

const processImage = async (buffer: Buffer): Promise<{ text: string; confidence: number }> => {
    const worker: Worker = await createWorker(config.TESSERACT_LANG);
    try {
        const grayscaleBuffer = await convertToGrayscale(buffer);
        const { data } = await worker.recognize(grayscaleBuffer);
        return { text: data.text, confidence: data.confidence };
    } finally {
        await worker.terminate();
    }
};

const isValidProof = (text: string): boolean => {
    return config.KEYWORDS.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
};

// Main function
export const imageHandlerChat = async (chatId: number, photos: PhotoSize[]): Promise<void> => {
    console.log("IMAGE HANDLER FUNCTION");
    await sendMessage(chatId, "Processing please wait ..🔃");
    if (!chatId || !Array.isArray(photos) || photos.length === 0) {
        console.error("Invalid input parameters");
        await sendMessage(chatId, "Invalid request");
        return;
    }

    try {
        const fileId = photos[photos.length - 1].file_id;
        const imageUrl = await getImageUrl(fileId);

        if (!imageUrl) {
            await sendMessage(chatId, "Error while getting image URL 🖼️");
            return;
        }

        const buffer = await createImageBufferFromUrl(imageUrl);
        const imageHash = await generateImageHash(buffer);
        console.log(`Image hash: ${imageHash}`);

        const { text, confidence } = await processImage(buffer);

        if (text && confidence >= config.MIN_CONFIDENCE) {
            console.log(text)
            console.log(`Extracted text (confidence ${confidence.toFixed(2)}%): ${text}`);
            if (isValidProof(text)) {
                const user = await prisma.user.findFirst({
                    where: {
                        telegram_id: chatId
                    }, include: {
                        submissions: true
                    }
                })
                if (!user) {
                    await sendMessage(chatId, `User NOT FOUND (first open the app)!`);
                    return

                }
                const alreadyImageUploaded = await prisma.submission.findFirst({
                    where: {
                        user_id: user.id,
                        proof: imageHash
                    }
                })
                if (alreadyImageUploaded) {
                    await sendMessage(chatId, `Duplicate Proof !!`);
                    return

                }
                const pending = await prisma.proof.findFirst({
                    where: {
                        userId: user.id,
                        telegram_id: chatId,

                    }
                })
                console.log({ pending })
                if (!pending) {
                    await sendMessage(chatId, `NO submission found create a submission first`);
                    return
                }

                const result = prisma.$transaction(async (prismaTx) => {
                    const subTask = await prismaTx.submission.create({
                        data: {
                            user_id: pending.userId,
                            task_id: pending.taskId,
                            amount: pending.amount!,

                            proof: imageHash,

                        }
                    })
                    const updatedUser = await prismaTx.user.update({
                        where: {
                            id: user.id
                        }, data: {
                            points: user.points + pending.amount!
                        }
                    })

                    const deletedProof = await prismaTx.proof.delete({
                        where: {
                            userId: user.id,
                            taskId: pending.taskId,
                            telegram_id: chatId
                        }
                    })
                    return { subTask, updatedUser, deletedProof }
                })
                console.log(result, "RESULT ✅")


                // await sendMessage(chatId, `submit directly`);

                await sendMessage(chatId, `Valid social proof detected (confidence: ${confidence.toFixed(2)}%)`);

                await sendMessage(chatId, `Congrats successfully submitted 🎉`);

            } else {
                await sendMessage(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%)`);
            }
        } else {
            await sendMessage(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%)`);
        }
    } catch (error) {
        console.error("Error in imageHandlerChat:", error);
        await sendMessage(chatId, "Error processing image");
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
