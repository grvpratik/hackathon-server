


import { ImageService } from "../services/image.service";
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ProofService } from "../services/proof.service";
import { sendMessage, sendMessageUser } from "../services/telegram.service";
import { getInitData } from "../middlewares/user.middleware";

const POINTS = 200


// Types
interface TelegramMessage {
    chat: {
        id: number;
        username?: string;
    };
    text?: string;
    photo?: any[];
}

interface TelegramUpdate {
    message?: TelegramMessage;
    callback_query?: any;
}

export async function handleVerifySubmission(req: Request, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        console.log('Received Telegram update:', JSON.stringify(body, null, 2));

        const { message }: TelegramUpdate = body;
        if (message && message.chat && message.text) {
            await handleUserMessage(message);
        }

        // if (callback_query) {
        //     await handleCallbackQuery(callback_query);
        // }


        if (message!.photo && message!.chat.id) {
            ImageService.handleImage(message!.chat.id, message!.photo)
        }

    } catch (error) {
        console.error('Error processing Telegram update:', error);
        next(error);
    }



}

export async function usertaskSubmission(req: Request, res: Response, next: NextFunction) {
    const taskId = req.params.taskId;
    const userData = getInitData(res);
    const chatId = userData?.user?.id;

    try {
        if (!chatId) {
            return res.status(400).json({ error: 'Chat ID is required.' });
        }


        const user = await UserService.findUserByTelegramId(chatId)

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        await ProofService.deletePendingProof(user.id, chatId)


        const submission = await ProofService.createProof(chatId, user.id, taskId, POINTS)


        await sendMessageUser(chatId, `Successfully created submission\nID: ${submission.id}\nPlease upload your proof.`);
        return res.status(201).json({ submissionId: submission.id });





    }
    catch (error) {
        console.error('Error processing Telegram update:', error);
        next(error);
    }

}

// Message handling
async function handleUserMessage(message: TelegramMessage) {
    const chatId = message.chat.id;
    const username = message.chat.username;
    const text = message.text;

    if (text?.startsWith('/')) {
        await handleUserCommand(chatId, text, username || 'user');
    }
}

// Command handling
const inlineKeyboard = {
    inline_keyboard: [
        // Row 1: Basic URL and callback buttons
        [
            { text: '🚀 Open App', url: "https://t.me/social_hunt_bot" },
            { text: '📋 View Tasks', callback_data: 'view_tasks' }
        ],
        // Row 2: Login and user profile
        [
            {
                text: '🔑 Login', login_url: {
                    url: 'https://your-domain.com/login',
                    forward_text: 'Login to Social Hunt',
                    bot_username: 'social_hunt_bot'
                }
            },
            {
                text: '👤 My Profile', web_app: {
                    url: 'https://your-domain.com/web-app'
                }
            }
        ],
        // Row 3: Share content and switch inline query
        [
            {
                text: '📢 Share App',
                switch_inline_query: 'Check out Social Hunt!'
            },
            {
                text: '🔍 Search Tasks',
                switch_inline_query_current_chat: 'task '
            }
        ],
        // Row 4: Game and pay options
        [
            {
                text: '🎮 Play Mini Game',
                callback_game: {} // The game short name will be set by the Bot API
            },
        
            {
                text: '💰 Buy Tokens',
                pay: true
            }
        ]
    ]
};

async function handleUserCommand(chatId: number, text: string, username: string) {
    const command = text.slice(1);
    if (command === 'start') {
        const welcomeMessage = `Hello @${username}
        
                                😸 Welcome to *Social Hunt*

                                💥 Complete tasks

                                🎁 Get Rewarded with Solana tokens`;

        await sendMessageUser(chatId, welcomeMessage, {
            parse_mode: 'MarkdownV2',
            reply_markup: inlineKeyboard
        });
    } else {
        await sendMessageUser(chatId, "Unknown command.");
    }
}
