import { NextFunction, Request, Response } from "express";
import { ImageService } from "../services/image.service";
import { UserService } from "../services/user.service";
import { ProofService } from "../services/proof.service";
import { sendMessageUser } from "../services/telegram.service";
import { getInitData } from "../middlewares/user.middleware";
import { imageHandlerChat } from "../temp/image-handler";

const POINTS = 200;

// Enhanced TypeScript interfaces
interface TelegramChat {
    id: number;
    username?: string;
    type: string;
}

interface TelegramPhoto {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
}

interface TelegramMessage {
    message_id: number;
    chat: TelegramChat;
    date: number;
    text?: string;
    photo?: TelegramPhoto[];
}

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: any;
}


export async function handleVerifySubmission(req: Request, res: Response, next: NextFunction) {
    try {
        // Validate request body
        if (!req.body || typeof req.body !== 'object') {
            console.error('Invalid request body received:', req.body);
            return res.status(400).json({
                success: false,
                message: "Invalid request body"
            });
        }

        const update: TelegramUpdate = req.body;

        // Enhanced logging
        console.log('Received Telegram update:', JSON.stringify(update, null, 2));

        // Verify update_id exists
        if (!update.update_id) {
            console.warn('Received update without update_id:', update);
            return res.status(400).json({
                success: false,
                message: "Missing update_id"
            });
        }

        const { message } = update;

        if (message) {
            await handleMessage(message);
        }

        res.status(200).json({
            success: true,
            message: "Update processed successfully"
        });
    } catch (error) {
        console.error('Error processing Telegram update:', error);


        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred"
        });


        // Optionally, pass the error to the next middleware
        // next(error);
    }
}


async function handleMessage(message: TelegramMessage) {
    try {
        const chatId = message.chat.id;
        const username = message.chat.username || 'unknown_user';

        console.log(`Processing message from ${username} (${chatId})`);

        if (message.text) {
            if (message.text.startsWith('/')) {
                await handleUserCommand(chatId, message.text, username);
            } else {
                await handleUserText(chatId, message.text, username);
            }
        } else if (message.photo && message.photo.length > 0) {
            await ImageService.handleImage(chatId, message.photo);
        } else {
            await sendMessageUser(chatId, "Sorry, I can only process text messages and photos at the moment.");
        }
    } catch (error) {
        console.error('Error in handleMessage:', error);
        throw error; // Re-throw to be caught by the main error handler
    }
}
async function handleUserText(chatId: number, text: string, username: string) {
    try {
        console.log(`Processing text message '${text}' from user ${username}`);
        // Add your logic for handling non-command text messages here
        await sendMessageUser(chatId, `Thank you for your message: "${text}"`);
    } catch (error) {
        console.error(`Error handling text message "${text}" for user ${username}:`, error);
        await sendMessageUser(chatId, "Sorry, there was an error processing your message. Please try again later.").catch(console.error);
        throw error;
    }
}
async function handleUserCommand(chatId: number, text: string, username: string) {
    try {
        const command = text.slice(1).toLowerCase();

        console.log(`Processing command '${command}' from user ${username}`);

        switch (command) {
            case 'start':
                const welcomeMessage = `Hello @${username}\n\n😸 Welcome to *Social Hunt*\n\n💥 Complete tasks\n\n🎁 Get Rewarded with Solana tokens`;
                await sendMessageUser(chatId, welcomeMessage, {
                    parse_mode: 'Markdown'
                });
                break;
            default:
                await sendMessageUser(chatId, "Unknown command. Type /start to begin.");
        }
    } catch (error) {
        console.error(`Error handling command ${text} for user ${username}:`, error);
        await sendMessageUser(chatId, "Sorry, there was an error processing your command. Please try again later.").catch(console.error);
        throw error;
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

        const user = await UserService.findUserByTelegramId(chatId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await ProofService.deletePendingProof(user.id, chatId);
        const submission = await ProofService.createProof(chatId, user.id, taskId, POINTS);

        await sendMessageUser(chatId, `Successfully created submission\nID: ${submission.id}\nPlease upload your proof.`);
        return res.status(201).json({ submissionId: submission.id });
    } catch (error) {
        console.error('Error in usertaskSubmission:', error);
        next(error);
    }

}