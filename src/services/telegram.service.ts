import axios, { AxiosError } from 'axios';

import { Platform, Action, State, UserState } from '../types';
import { TELEGRAM_API_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USER_TOKEN, TELEGRAM_USER_API_URL } from '../config/constant';

export function getInitialKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Youtube 🎥', callback_data: Platform.YOUTUBE }],
                [{ text: 'X (twitter) 🐦', callback_data: Platform.TWITTER }],
                [{ text: 'Discord 💬', callback_data: Platform.DISCORD }],
                [{ text: 'Telegram 📩', callback_data: Platform.TELEGRAM }],
            ],
        },
    };
}

export function getPlatformActionKeyboard(platform: Platform) {
    const keyboards: Record<Platform, { reply_markup: { inline_keyboard: any[][] } }> = {
        [Platform.YOUTUBE]: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Subscribe', callback_data: `${platform}_${Action.SUBSCRIBE}` }],
                    [{ text: 'Like & comment', callback_data: `${platform}_${Action.LIKE_COMMENT}` }],
                ],
            },
        },
        [Platform.TWITTER]: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Follow', callback_data: `${platform}_${Action.FOLLOW}` }],
                    [{ text: 'Like & retweet', callback_data: `${platform}_${Action.LIKE_RETWEET}` }],
                ],
            },
        },
        [Platform.DISCORD]: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Join', callback_data: `${platform}_${Action.JOIN}` }],
                ],
            },
        },
        [Platform.TELEGRAM]: {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Join', callback_data: `${platform}_${Action.JOIN}` }],
                ],
            },
        },
    };

    return keyboards[platform];
}

export function getPricingKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '1 SOL (3 days)', callback_data: 'price_1' }],
                [{ text: '2 SOL (6 days)', callback_data: 'price_2' }],
            ],
        },
    };
}

export function getConfirmationKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Confirm', callback_data: 'confirm' }],
                [{ text: 'Cancel', callback_data: 'cancel' }],
            ],
        },
    };
}


export async function sendMessage(chatId: number, text: string, options = {}) {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text,
            ...options,
        },);
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
export async function sendMessageUser(chatId: number, text: string, options = {}) {


    await fetch(`${TELEGRAM_USER_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            ...options,
        }),
    });


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
    const fileResponse = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_USER_TOKEN}/getFile?file_id=${fileId}`);
    if (fileResponse.status !== 200) {
        console.log("error while fetching image")
        return null
    }
    const filePath = (await fileResponse.data).result.file_path;
    if (filePath) {
        const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_USER_TOKEN}/${filePath}`;
        return imageUrl
    } else {
        return null
    }

}
export async function getFilePath(fileId: string) {
    return await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_USER_TOKEN}/getFile?file_id=${fileId}`);
}

export async function getFileUrl(filePath: string) {
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_USER_TOKEN}/${filePath}`
}

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_USER_TOKEN}`;

export async function sendReplyUser(chatId: number, responseText: string) {
    return await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: responseText
    });
}