import { config } from "../types";
import { createImageBufferFromUrl, generateImageHash, processImage } from "../utils/chatbot";

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
    }
}

