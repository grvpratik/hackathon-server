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
exports.isValidProof = exports.processImage = exports.createImageBufferFromUrl = exports.generateImageHash = exports.convertToGrayscale = exports.escapeMarkdown = void 0;
const tesseract_js_1 = require("tesseract.js");
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
const https_1 = __importDefault(require("https"));
const types_1 = require("../types");
const escapeMarkdown = (text) => {
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
exports.escapeMarkdown = escapeMarkdown;
const convertToGrayscale = (imageBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, sharp_1.default)(imageBuffer).greyscale().toBuffer();
});
exports.convertToGrayscale = convertToGrayscale;
const generateImageHash = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    const resizedBuffer = yield (0, sharp_1.default)(buffer)
        .resize(8, 8, { fit: 'fill' })
        .greyscale()
        .raw()
        .toBuffer();
    return crypto_1.default.createHash('md5').update(resizedBuffer).digest('hex');
});
exports.generateImageHash = generateImageHash;
const createImageBufferFromUrl = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("image buffer");
    const response = yield axios_1.default.get(imageUrl, {
        responseType: 'arraybuffer',
        httpsAgent: new https_1.default.Agent({ rejectUnauthorized: true })
    });
    return (0, sharp_1.default)(Buffer.from(response.data)).toBuffer();
});
exports.createImageBufferFromUrl = createImageBufferFromUrl;
const processImage = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside image process");
    const worker = yield (0, tesseract_js_1.createWorker)(types_1.config.TESSERACT_LANG);
    try {
        const grayscaleBuffer = yield (0, exports.convertToGrayscale)(buffer);
        const { data } = yield worker.recognize(grayscaleBuffer);
        return { text: data.text, confidence: data.confidence };
    }
    finally {
        yield worker.terminate();
    }
});
exports.processImage = processImage;
const isValidProof = (text) => {
    return types_1.config.KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
};
exports.isValidProof = isValidProof;
