import { config, PhotoSize } from "../types";
import { createImageBufferFromUrl, generateImageHash, isValidProof, processImage } from "../utils/chatbot";
import { ProofService } from "./proof.service";
import { SubmissionService } from "./submission.service";
import { getImageUrl, sendMessage, sendMessageUser } from "./telegram.service";
import { UserService } from "./user.service";

export const ImageService= {
    async processImage(imageUrl: string) {
        const buffer = await createImageBufferFromUrl(imageUrl);
        const { text, confidence } = await processImage(buffer);
        const imageHash = await generateImageHash(buffer);
        return { text, confidence, imageHash };
    }
,
   isValidImage(text: string, confidence: number): boolean {
        return !!text && confidence >= config.MIN_CONFIDENCE;
    },

    async handleImage (chatId: number, photos: PhotoSize[]): Promise<void> {
        console.log("IMAGE HANDLER FUNCTION");

        if (!chatId || !Array.isArray(photos) || photos.length === 0) {
            console.error("Invalid input parameters");
            await sendMessageUser(chatId, "Invalid request. Please try again with a valid image.");
            return;
        }

        await sendMessageUser(chatId, "Processing your image, please wait... 🔄");

        try {
            const fileId = photos[photos.length - 1].file_id;
            const imageUrl = await getImageUrl(fileId);

            if (!imageUrl) {
                throw new Error("Failed to get image URL");
            }

            const user = await UserService.findUserByTelegramId(chatId);

            if (!user) {
                await sendMessageUser(chatId, "User not found. Please open the app first to create your account.");
                return;
            }

            const pending = await ProofService.findPendingProof(user.id, chatId);

            if (!pending) {
                await sendMessageUser(chatId, "No pending submission found. Please create a submission first.");
                return;
            }

            const { text, confidence, imageHash } = await ImageService.processImage(imageUrl);

            if (!ImageService.isValidImage(text, confidence)) {
                await sendMessageUser(chatId, `Unable to extract text with sufficient confidence (${confidence.toFixed(2)}%). Please try uploading a clearer image.`);
                return;
            }
            if (!isValidProof(text)) {
                await sendMessageUser(chatId, `Not a valid proof (confidence: ${confidence.toFixed(2)}%). Please ensure the image contains relevant social media content.`);
                return;
            }
            if (await SubmissionService.isDuplicateSubmission(user.id, imageHash)) {
                await sendMessageUser(chatId, "Duplicate proof detected. Please submit a new, unique image.");
                return;
            }

            const result = await SubmissionService.createSubmission(user.id, pending, imageHash);

            console.log("Transaction result:", result);
            await sendMessageUser(chatId, `Congratulations! Your submission was successful. 🎉\nYou've earned ${pending.amount} points!`);
        } catch (error) {
            console.error("Error in imageHandlerChat:", error);
            await sendMessageUser(chatId, "An unexpected error occurred while processing your image. Please try again later.");
        }
    }
}

