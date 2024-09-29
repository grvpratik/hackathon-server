import { PhotoSize } from "../types";


import { getImageUrl, sendMessage } from "../services/telegram.service";
import { ProofService } from "../services/proof.service";
import { UserService } from "../services/user.service";
import { ImageService } from "../services/image.service";
import { isValidProof } from "../utils/chatbot";
import { SubmissionService } from "../services/submission.service";
import { Request, Response } from "express";


export async function handleVerifySubmission(req: Request, res: Response) {
    try {
        const body = req.body;
        // console.log('Received Telegram update:', JSON.stringify(body, null, 2));

        const { message, callback_query } = body;

        if (message.photo && message.chat.id) {
            handleImage(message.chat.id, message.photo)
        }

    } catch (error) {
        console.error('Error processing Telegram update:', error);
        res.status(500).json({ error: 'Server error' });
    }



}




















export const handleImage = async (chatId: number, photos: PhotoSize[]): Promise<void> => {
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

        const user = await UserService.findUserByTelegramId(chatId);

        if (!user) {
            await sendMessage(chatId, "User not found. Please open the app first to create your account.");
            return;
        }

        const pending = await ProofService.findPendingProof(user.id, chatId);

        if (!pending) {
            await sendMessage(chatId, "No pending submission found. Please create a submission first.");
            return;
        }

        const { text, confidence, imageHash } = await ImageService.processImage(imageUrl);

        if (!ImageService.isValidImage(text, confidence)) {
            await sendMessage(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%). Please try uploading a clearer image.`);
            return;
        }
        if (!isValidProof(text)) {
            await sendMessage(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%). Please ensure the image contains relevant social media content.`);
            return;
        }
        if (await SubmissionService.isDuplicateSubmission(user.id, imageHash)) {
            await sendMessage(chatId, "Duplicate proof detected. Please submit a new, unique image.");
            return;
        }

        const result = await SubmissionService.createSubmission(user.id, pending, imageHash);

        console.log("Transaction result:", result);
        await sendMessage(chatId, `Congratulations! Your submission was successful. 🎉\nYou've earned ${pending.amount} points!`);
    } catch (error) {
        console.error("Error in imageHandlerChat:", error);
        await sendMessage(chatId, "An unexpected error occurred while processing your image. Please try again later.");
    }
};