import Tesseract from "tesseract.js";
import axios from "axios";
import sharp from "sharp";
import crypto from 'crypto';
import https from 'https';

import { config } from "../types";


export const escapeMarkdown = (text: string) => {
    return text
        .replace(/_/g, "\\_")
        .replace(/\*/g, "\\*")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/~/g, "\\~")
        .replace(/`/g, "\\`")
        .replace(/>/g, "\\>")
        .replace(/#/g, "\\#")
        .replace(/\+/g, "\\+")
        .replace(/-/g, "\\-")
        .replace(/=/g, "\\=")
        .replace(/\|/g, "\\|")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\./g, "\\.")
        .replace(/!/g, "\\!");
};
export const convertToGrayscale = async (imageBuffer: Buffer): Promise<Buffer> => {
    return sharp(imageBuffer).greyscale().toBuffer();
};

export const generateImageHash = async (buffer: Buffer): Promise<string> => {
    const resizedBuffer = await sharp(buffer)
        .resize(8, 8, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer();

    return crypto.createHash('md5').update(resizedBuffer).digest('hex');
};

export const createImageBufferFromUrl = async (imageUrl: string): Promise<Buffer> => {

    const response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
        httpsAgent: new https.Agent({ rejectUnauthorized: true })
    });
    return sharp(Buffer.from(response.data)).toBuffer();

};

export const processImage = async (buffer: Buffer): Promise<{ text: string; confidence: number }> => {
    const worker =await Tesseract.createWorker(config.TESSERACT_LANG);
    try {
        const grayscaleBuffer = await convertToGrayscale(buffer);
        const { data } = await Tesseract.recognize(grayscaleBuffer);
        return { text: data.text, confidence: data.confidence };
    } finally {
        await worker.terminate();
    }
};

export const isValidProof = (text: string): boolean => {
    return config.KEYWORDS.some(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
};
