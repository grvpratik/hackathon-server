import axios, { AxiosError } from 'axios';




export const TELEGRAM_BOT_TOKEN = "7041386853:AAEW5znTrN0WavEQPnOar-9puS98r5Zw_hU"
export const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN!}`;
// console.log({ TELEGRAM_API_URL })


export async function sendMessage(chatId: number, text: string, options = {}) {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text,
            ...options,
        }, );
        return response.data;
    } catch (error) {
        console.error("SEND MESSAGE ERROR", error);
        if (axios.isAxiosError(error)) {
            console.error('Error sending message to Telegram:', error.response?.data || error.message);
            if (error.code === 'ECONNABORTED') {
                console.error('The request timed out');
            }
        }
        // throw error;
        
    }
}

export async function editMessageReplyMarkup(chatId: number, messageId: number) {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/editMessageReplyMarkup`, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [],
            },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error editing message reply markup:', error.response?.data || error.message);
        }
        throw error;
    }
}
export async function getImageUrl(fileId: string) {
    const fileResponse = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    if (fileResponse.status !== 200) {
        console.log("error while fetching image")
        return null
    }
    const filePath = (await fileResponse.data).result.file_path;
    if (filePath) {
        const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
        return imageUrl
    } else {
        return null
    }

}