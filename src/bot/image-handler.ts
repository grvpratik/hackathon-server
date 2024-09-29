
// Main function

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
