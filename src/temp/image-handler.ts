import { createWorker, Worker } from "tesseract.js";
import { getImageUrl, sendMessage } from "./bot-function";
import axios from "axios";
import sharp from "sharp";
import crypto from 'crypto';
import https from 'https';
import { prisma } from "..";


// Types
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

// Configuration
const config: Config = {
    KEYWORDS: ["posts", "following", "others", "followers", "Pinned", "Replies", "joined", "highlights", "Follow", "Subscribe", "YouTube", "Like", "Comment", "Twitter"],
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
        const response = await axios.get<ArrayBuffer>(imageUrl, {
            responseType: 'arraybuffer',
          
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

        const buffer = await createImageBufferFromUrl(imageUrl);
        const imageHash = await generateImageHash(buffer);
        console.log(`Image hash: ${imageHash}`);

        const { text, confidence } = await processImage(buffer);

        if (!text || confidence < config.MIN_CONFIDENCE) {
            await sendMessage(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%). Please try uploading a clearer image.`);
            return;
        }

        console.log(`Extracted text (confidence ${confidence.toFixed(2)}%): ${text}`);

        if (!isValidProof(text)) {
            await sendMessage(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%). Please ensure the image contains relevant social media content.`);
            return;
        }

        const user = await prisma.user.findFirst({
            where: { telegram_id: chatId },
            include: { submissions: true }
        });

        if (!user) {
            await sendMessage(chatId, "User not found. Please open the app first to create your account.");
            return;
        }

        const alreadyImageUploaded = await prisma.submission.findFirst({
            where: { user_id: user.id, proof: imageHash }
        });

        if (alreadyImageUploaded) {
            await sendMessage(chatId, "Duplicate proof detected. Please submit a new, unique image.");
            return;
        }

        const pending = await prisma.proof.findFirst({
            where: { userId: user.id, telegram_id: chatId }
        });

        if (!pending) {
            await sendMessage(chatId, "No pending submission found. Please create a submission first.");
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