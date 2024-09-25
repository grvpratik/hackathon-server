import { createWorker } from "tesseract.js";
import { getImageUrl, sendMessage } from "./bot-function";


export const imageHandlerchat = async (chatId: any, photo: any) => {
    console.log("IMAGE HANDLER FUNCTION");

    try {

        const fileId = photo[photo.length - 1].file_id;
        const imageUrl = await getImageUrl(fileId)
        console.log({ imageUrl })
        if (imageUrl) {
            try {
                const worker = await createWorker('eng');
                const ret = await worker.recognize(imageUrl);
                console.log(ret);
                if (ret.data.text) {
                    await sendMessage(chatId, ret.data.text)
                } else {
                    await sendMessage(chatId, "Not a valid proof")
                }
                
                await worker.terminate();
            } catch (error) {
                await sendMessage(chatId, "Error while processing image")
                console.error(error)
            }
        } else {
            await sendMessage(chatId, "Error while getting image URl 🖼️")
        }


        // await sendMessage(chatId, imageUrl);


    } catch (error) {
        console.error("Error in imageHandlerchat:", error);
        await sendMessage(chatId, "Error in fetching image")
        // You might want to send a message to the user or handle the error in some way
    }
}


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
