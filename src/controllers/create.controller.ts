// src/controllers/create.controller.ts
import { NextFunction, Request, Response } from 'express';
import { Platform, Action, State, UserState } from '../types';
import { validateUrl } from '../utils/url-validator';
import { checkPayer, checkPayerFound, findPayerById } from '../services/payer.service';

import { createPaymentToken } from '../utils/jwt';

import {
    getInitialKeyboard,
    getPlatformActionKeyboard,
    getPricingKeyboard,
    getConfirmationKeyboard,
} from '../services/telegram.service';
import { sendMessage, editMessageReplyMarkup } from '../services/telegram.service';
import { escapeMarkdown } from '../utils/chatbot';
import { BASE_URL } from '../config/constant';
import { createTask, getTasksForPayer } from '../services/task.service';

const userStates: Map<number, UserState> = new Map();

export async function handleCreateRequest(req: Request, res: Response,next:NextFunction) {
    try {
        const { message, callback_query } = req.body;

        if (message && message.chat && message.text) {
            await handleMessage(message);
        }

        if (callback_query) {
            await handleCallbackQuery(callback_query);
        }

        res.status(200).json({
            success: true,
            message: "Update processed successfully"
        });
    } catch (error) {
        res.status(200).json({
            success: true,
            message: "Update processed successfully"
        });
        next(error);
    }
}









async function handleMessage(message: any) {
    const chatId = message.chat.id;
    const text = message.text;

    if (text.startsWith('/')) {
        await handleCommand(chatId, text);
    } else {
        await handleUserInput(chatId, text);
    }
}

async function handleCommand(chatId: number, text: string) {
    const command = text.slice(1);
    if (command === 'start') {
        userStates.set(chatId, { state: State.INITIAL });
        await sendMessage(chatId, "Hi! Choose a Platform:", getInitialKeyboard());
    } else if (command === 'list') {
        await handleListCommand(chatId);
    } else {
        await sendMessage(chatId, "Unknown command.");
    }
}

async function handleUserInput(chatId: number, text: string) {
    const userState = userStates.get(chatId);
    if (userState && userState.state === State.URL_REQUIRED && userState.platformAction) {
        if (validateUrl(text, userState.platformAction.platform)) {
            userState.url = text;
            userState.state = State.PRICING;
            userStates.set(chatId, userState);
            await sendMessage(chatId, "URL validated. Choose a price:", getPricingKeyboard());
        } else {
            await sendMessage(chatId, "Invalid URL. Please try again with a valid URL for the selected platform.");
        }
    }
}

async function handleCallbackQuery(callback_query: any) {
    const chatId = callback_query.message.chat.id;
    const messageId = callback_query.message.message_id;
    const data = callback_query.data;
    const first_name = callback_query.message.chat.first_name;
    const last_name = callback_query.message.chat.username;
    await editMessageReplyMarkup(chatId, messageId);

    if (Object.values(Platform).includes(data as Platform)) {
        await handlePlatformSelection(chatId, data as Platform);
    } else if (data.startsWith('price_')) {
        await handlePriceSelection(chatId, data);
    } else if (data.includes('_')) {
        await handleActionSelection(chatId, data);
    } else if (data === 'confirm' || data === 'cancel') {
        await handleConfirmation(chatId, data, callback_query.message.chat,first_name,last_name);
    }
}

async function handlePlatformSelection(chatId: number, platform: Platform) {
    userStates.set(chatId, {
        state: State.PLATFORM_SELECTED,
        platformAction: { platform, action: null }
    });
    await sendMessage(chatId, `You chose ${platform}. Now select type:`, getPlatformActionKeyboard(platform));
}

async function handlePriceSelection(chatId: number, data: string) {
    const userState = userStates.get(chatId);
    if (userState && userState.state === State.PRICING) {
        const price = parseInt(data.split('_')[1]);
        userState.price = price;
        userState.state = State.CONFIRMATION;
        userStates.set(chatId, userState);

        const confirmationMessage = `Please confirm your order:\n
Platform: ${userState.platformAction?.platform || ''}\n
Action: ${userState.platformAction?.action || ''}\n
URL: ${userState.url || ''}\n
Price: $${price}`;

        await sendMessage(chatId, confirmationMessage, getConfirmationKeyboard());
    }
}

async function handleActionSelection(chatId: number, data: any) {

    const [platform, action] = data.split('_') as [Platform, Action];
    const userState = userStates.get(chatId);
    if (userState && userState.state === State.PLATFORM_SELECTED) {

        userState.platformAction = { platform, action };
        userState.state = State.URL_REQUIRED;
        userStates.set(chatId, userState);

        await sendMessage(chatId, `Please enter the URL for ${platform} ${action}:`);
    }
}
async function handleConfirmation(chatId: number, data: any, chat: any,first_name:string,last_name:string) {
    const userState = userStates.get(chatId);
    if (userState && userState.state === State.CONFIRMATION) {
        if (data === 'confirm') {
            // Send a confirmation message with all order details
            try {
                const creator = await checkPayer(chatId, first_name, last_name);
                console.log(creator, "creator")
                const payerId = creator.id;

                const platform = userState.platformAction?.platform
                const taskName = userState.platformAction?.action
                const amount = userState.price
                const taskLink = userState.url
                const signature = ""
                if (platform && taskName && amount && taskLink) {
                    const { token } = await handleUserConfirmation(payerId, platform, taskName, amount, signature, taskLink,);

                    await sendMessage(chatId, `Order Saved. Kindly pay through below link \n Platform: ${userState.platformAction?.platform}\n
                     
                       Action: ${userState.platformAction?.action}\n
                       URL: ${userState.url}\n
                       Price: ${userState.price}SOL\n
                       Payment link:${BASE_URL}?token=${token}`);
                }
            } catch (error) {
                await sendMessage(chatId, "Order Creation failed!")
               
            }



        } else {
            // Send a cancellation message
            await sendMessage(chatId, "Order cancelled. You can start over with the /start command.");
        }
        // Clear the user state after confirming or cancelling
        userStates.delete(chatId);
    }
}

async function handleListCommand(chatId:number) {
    await sendMessage(chatId, "Here are the list of Tasks: ");
    const userFound =await checkPayerFound(chatId)
    if (!userFound) {
        await sendMessage(chatId, "User not found. ❌ ");
        return
    }
    const taskList = await getTasksForPayer(userFound.id)
    if (!taskList) {
         await sendMessage(chatId, "Task not found. ❌ ");
        return
    }
    taskList.map(async (x) => {

        const taskMessage = `
*📌 Task Name*: ${escapeMarkdown(x.task_name)}\n
*🖥️ Platform*: ${escapeMarkdown(x.platform)}\n
*💰 Amount*: \ ${escapeMarkdown(x.amount.toString())}SOL\n
*🔗 Link*: ${x.task_link ? `[Click here](${escapeMarkdown(x.task_link)})` : 'No link provided'}\n
*💵 Payment*: ${x.signature ? '✅ Done' : '❌ Not done'}\n
*⏳ Status*: ${x.status === 'Hold' ? '⏸️ On Hold' : escapeMarkdown(x.status!)}
THIS IS TEST
    `.trim();

        await sendMessage(chatId, taskMessage, { parse_mode: 'MarkdownV2' });
    });


}

async function handleUserConfirmation(
    payerId: string,
    platform: Platform,
    taskName: string,
    amount: number,
    signature: string,
    taskLink: string,
    comment?: string,

) {
    try {
        // First, check if the payer exists
        const payer = await findPayerById(payerId)

        if (!payer) {
            throw new Error('Payer not found');
        }


        const endDate = new Date()
        const task = await createTask(payerId, platform, taskName, amount, signature, taskLink, endDate, comment);
        console.log('Task created on user confirmation:', task);
        const token = await createPaymentToken(payerId, task.id,amount)
        return { task, token };
    } catch (error) {
        console.error('Error handling user confirmation:', error);
        throw error;
    }
}