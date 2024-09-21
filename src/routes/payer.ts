import * as jose from 'jose'

import { prisma } from "..";
import { Request, Response, Router } from "express";
import axios, { AxiosError } from 'axios';
import { Platforms, TaskStatus } from "@prisma/client";
import { authMiddleware } from '../middleware';

import nacl from 'tweetnacl';


import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const connection = new Connection(process.env.RPC_URL ?? "https://api.devnet.solana.com");

const PARENT_WALLET_ADDRESS = "j1oAbxxiDUWvoHxEDhWE7THLjEkDQW2cSHYn2vttxTF";







const router = Router();

export const secret = new TextEncoder().encode(
    'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2'
)
const BASE_URL = "https://twa-lake.vercel.app/payment"
async function createPaymentToken(payerId: string, taskId: string) {
    const jwt = await new jose.SignJWT({ payerId, taskId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret)

    return jwt
}
// Define types and enums
enum Platform {
    YOUTUBE = 'youtube',
    TWITTER = 'twitter',
    DISCORD = 'discord',
    TELEGRAM = 'telegram',
}

enum Action {
    SUBSCRIBE = 'subscribe',
    LIKE_COMMENT = 'like_comment',
    FOLLOW = 'follow',
    LIKE_RETWEET = 'like_retweet',
    JOIN = 'join',
}

enum State {
    INITIAL = 'initial',
    PLATFORM_SELECTED = 'platform_selected',
    ACTION_SELECTED = 'action_selected',
    URL_REQUIRED = 'url_required',
    PRICING = 'pricing',
    CONFIRMATION = 'confirmation',
}

interface PlatformAction {
    platform: Platform;
    action: Action | null;
}

interface UserState {
    state: State;
    platformAction?: PlatformAction;
    url?: string;
    price?: number;
}


async function checkPayer(telegramId: number, firstName?: string, lastName?: string, address?: string) {
    try {
        // Check if the payer already exists
        const existingPayer = await prisma.payer.findUnique({
            where: {
                telegram_id: telegramId,
            },
        });

        // If payer exists, return the existing payer
        if (existingPayer) {
            console.log('Payer found:', existingPayer);
            return existingPayer;
        }

        // If payer does not exist, create a new one
        const newPayer = await prisma.payer.create({
            data: {
                telegram_id: telegramId,
                first_name: firstName,
                Last_name: lastName,
                address: address,
            },
        });

        console.log('Payer created:', newPayer);
        return newPayer;
    } catch (error) {
        console.error('Error in checkPayer function:', error);
        throw error;
    }
}


// Function to create a new task
async function createTask(
    payerId: string,
    platform: Platforms,
    taskName: string,
    amount: number,
    signature: string,
    taskLink: string,
    endDate: Date,

    comment?: string,

) {
    try {
        const task = await prisma.task.create({
            data: {
                platform,
                task_name: taskName,
                amount,
                signature,
                task_link: taskLink,
                comment,
                payer_id: payerId,
                status: TaskStatus.Hold,
                endDate// Set the initial status to Active
            },
        });
        console.log('Task created:', task);
        return task;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

// Function to handle user confirmation and create a task
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
        const payer = await prisma.payer.findUnique({
            where: { id: payerId },
        });

        if (!payer) {
            throw new Error('Payer not found');
        }


        const endDate = new Date()
        const task = await createTask(payerId, platform, taskName, amount, signature, taskLink, endDate, comment);
        console.log('Task created on user confirmation:', task);
        const token = await createPaymentToken(payerId, task.id)
        return { task, token };
    } catch (error) {
        console.error('Error handling user confirmation:', error);
        throw error;
    }
}








// In-memory store for user states (replace with a database in production)
const userStates: Map<number, UserState> = new Map();
const TELEGRAM_BOT_TOKEN = "6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc"
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN!}`;
// console.log({ TELEGRAM_API_URL })

// Helper functions
async function sendMessage(chatId: number, text: string, options = {}) {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text,
            ...options,
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error sending message to Telegram:', error.response?.data || error.message);
        }
        throw error;
    }
}

async function editMessageReplyMarkup(chatId: number, messageId: number) {
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

function getInitialKeyboard() {
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
function getListKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [

            ],
        },
    };
}
function getPlatformActionKeyboard(platform: Platform) {
    switch (platform) {
        case Platform.YOUTUBE:
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Subscribe', callback_data: `${platform}_${Action.SUBSCRIBE}` }],
                        [{ text: 'Like & comment', callback_data: `${platform}_${Action.LIKE_COMMENT}` }],
                    ],
                },
            };
        case Platform.TWITTER:
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Follow', callback_data: `${platform}_${Action.FOLLOW}` }],
                        [{ text: 'Like & retweet', callback_data: `${platform}_${Action.LIKE_RETWEET}` }],
                    ],
                },
            };
        case Platform.DISCORD:
        case Platform.TELEGRAM:
            return {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Join', callback_data: `${platform}_${Action.JOIN}` }],
                    ],
                },
            };
    }
}

function getPricingKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: '$50', callback_data: 'price_50' }],
                [{ text: '$100', callback_data: 'price_100' }],
            ],
        },
    };
}

function getConfirmationKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Confirm', callback_data: 'confirm' }],
                [{ text: 'Cancel', callback_data: 'cancel' }],
            ],
        },
    };
}

function validateUrl(url: string, platform: Platform): boolean {
    const platformDomains = {
        [Platform.YOUTUBE]: 'youtube.com',
        [Platform.TWITTER]: 'twitter.com',
        [Platform.DISCORD]: 'discord.gg',
        [Platform.TELEGRAM]: 't.me',
    };

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.includes(platformDomains[platform]);
    } catch {
        return false;
    }
}




router.post("/create", async (req: Request, res: Response) => {
    // const payer = await prisma.payer.findMany();
    // console.log(payer)
    // res.send("payer")
    console.log("start")
    try {
        const body = req.body;
        console.log('Received Telegram update:', JSON.stringify(body, null, 2));

        const { message, callback_query } = body;

        if (message && message.chat && message.text) {
            const chatId = message.chat.id;
            const text = message.text;

            if (text.startsWith('/')) {
                const command = text.slice(1);
                if (command === 'start') {
                    userStates.set(chatId, { state: State.INITIAL });
                    await sendMessage(chatId, "Hi! Choose a Platform:", getInitialKeyboard());
                } else if (command === 'list') {
                    await sendMessage(chatId, "Here are the list of Tasks: ");
                    const userFound = await prisma.payer.findUnique({
                        where: {
                            telegram_id: chatId
                        }
                    })
                    if (!userFound) {
                        await sendMessage(chatId, "User not found. ❌ ");

                    }
                    const taskList = await prisma.task.findMany({
                        where: {
                            payer_id: userFound?.id
                        }
                    })
                    if (!taskList) {
                        await sendMessage(chatId, "Task not found. ❌ ");
                    }
                    taskList.map(async (x) => {
                        const taskMessage = `
                                                📌 *Task Name*: _${x.task_name}_
                                                🖥️ *Platform*: ${ x.platform}
                                                💰 *Amount*: $${x.amount} 
                                                🔗 *Link*: ${x.signature ? `[Click here](${x.signature})` : 'No link provided'}
                                                ⏳ *Status*: ${x.status === 'Hold' ? '⏸️ On Hold' : x.status}
                                                 `.replace(/\./g, '\\.');  

                        await sendMessage(chatId, taskMessage, { parse_mode: 'MarkdownV2' });
                    });

                } else {
                    await sendMessage(chatId, "Unknown command.");
                }
            } else {
                try {
                    const userState = userStates.get(chatId);
                    if (userState && userState.state === State.URL_REQUIRED && userState.platformAction) {
                        console.log("inside validation")
                        if (validateUrl(text, userState.platformAction.platform)) {
                            console.log("validate url", userState)
                            userState.url = text;
                            userState.state = State.PRICING;
                            userStates.set(chatId, userState);
                            await sendMessage(chatId, "URL validated. Choose a price:", getPricingKeyboard());
                        } else {
                            await sendMessage(chatId, "Invalid URL. Please try again with a valid URL for the selected platform.");
                        }
                    }
                } catch (error) {
                    console.error(error)
                    await sendMessage(chatId, "Error occured while processing url try again");
                }


            }
        }

        if (callback_query) {
            console.log(callback_query.chat)
            // Extract relevant information from the callback query
            const chatId = callback_query.message.chat.id;
            const messageId = callback_query.message.message_id;
            const data = callback_query.data;

            const first_name = callback_query.message.chat.first_name;
            const last_name = callback_query.message.chat.username;
            // Remove the inline keyboard from the previous message
            await editMessageReplyMarkup(chatId, messageId);

            console.log("data inside callback_query", data);

            // Handle platform selection
            if (Object.values(Platform).includes(data as Platform)) {
                // Set the user state to platform selected and store the chosen platform
                userStates.set(chatId, {
                    state: State.PLATFORM_SELECTED,
                    platformAction: { platform: data as Platform, action: null }
                });
                // Send a message asking the user to select an action for the chosen platform
                await sendMessage(chatId, `You chose ${data}. Now select type:`, getPlatformActionKeyboard(data as Platform));
            }
            // Handle price selection
            else if (data.startsWith('price_')) {
                console.log("price");
                const userState = userStates.get(chatId);
                console.log("price with", userState?.state);
                if (userState && userState.state === State.PRICING) {
                    // Extract the price from the callback data
                    const price = parseInt(data.split('_')[1]);
                    // Update the user state with the selected price and move to confirmation state
                    userState.price = price;
                    userState.state = State.CONFIRMATION;
                    userStates.set(chatId, userState);

                    // Prepare and send a confirmation message with order details
                    const confirmationMessage = `Please confirm your order:
                Platform: ${userState.platformAction?.platform}
               Action: ${userState.platformAction?.action}
                  URL: ${userState.url}
                Price: $${price}`;

                    await sendMessage(chatId, confirmationMessage, getConfirmationKeyboard());
                }
            }
            // Handle action selection for a platform
            else if (data.includes('_')) {
                // Split the data into platform and action
                console.log("_ check")
                const [platform, action] = data.split('_') as [Platform, Action];
                const userState = userStates.get(chatId);
                if (userState && userState.state === State.PLATFORM_SELECTED) {
                    // Update the user state with the selected action and move to URL input state
                    userState.platformAction = { platform, action };
                    userState.state = State.URL_REQUIRED;
                    userStates.set(chatId, userState);
                    // Prompt the user to enter a URL for the chosen platform and action
                    await sendMessage(chatId, `Please enter the URL for ${platform} ${action}:`);
                }
            }
            // Handle order confirmation or cancellation
            else if (data === 'confirm' || data === 'cancel') {
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

                                await sendMessage(chatId, `Order Saved. Kindly pay through below link  Platform: ${userState.platformAction?.platform}
                     
                       Action: ${userState.platformAction?.action}
                       URL: ${userState.url}
                       Price: $${userState.price}
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
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Error processing Telegram update:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get("/create", async (req: Request, res: Response) => { 
    res.status(200).json({message:"create route ok "})
})

router.post("/wallet", authMiddleware, async (req: Request, res: Response) => {
    // @ts-ignore
    const payerId: string = req.payerId;
    // @ts-ignore
    console.log(req.payerId)

    // Check if payerId is defined
    if (!payerId) {
        return res.status(400).json({ message: "Payer ID is required" });
    }

    try {
        const { signature, publicKey } = req.body;
        console.log({ signature, publicKey });
        const message = new TextEncoder().encode("Sign into mechanical turks");

        const result = nacl.sign.detached.verify(
            message,
            new Uint8Array(signature.data),
            new PublicKey(publicKey).toBytes(),
        );

        console.log({ result });
        if (!result) {
            return res.status(411).json({
                message: "Incorrect signature",
            });
        }

        const payer = await prisma.payer.findFirst({
            where: {
                id: payerId,
            },
        });
        console.log({ payer });

        try {
            const updated = await prisma.payer.update({
                where: {
                    id: payerId,
                },
                data: {
                    address: publicKey,
                },
            });
            console.log({ updated });

            // Send success response here
            return res.status(200).json({ message: "Success" });
        } catch (error) {
            console.error(error)
            // Send wallet update failed response if error occurs
            return res.status(403).json({ message: "Wallet update failed" });
        }

    } catch (error) {
        // Send failure response for adding wallet address
        return res.status(403).json({ message: "Failed adding wallet address" });
    }
});


router.post("/task", authMiddleware, async (req, res) => {
    try {
        // Extract taskId and userId from req object (set in authMiddleware)
        // @ts-ignore
        const taskId: string = req.taskId;
        // @ts-ignore
        const userId = req.userId;
        const { signature } = req.body;

        // Early check for missing signature
        if (!signature) {
            return res.status(403).json({ message: "Signature missing" });
        }

        // Fetch the user based on userId
        const user = await prisma.payer.findFirst({
            where: { id: userId }
        });

        // Early return if user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the transaction from the Solana network
        const transaction = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 1
        });

        // Early return if the transaction is null
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        console.log(transaction);

        // Check if the amount transferred matches 0.1 SOL (100000000 lamports)
        const transferredAmount = (transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0);
        if (transferredAmount !== 100000000) {
            return res.status(411).json({ message: "Transaction signature/amount incorrect" });
        }

        // Check if the recipient is the correct parent wallet address
        const recipientAddress = transaction?.transaction.message.getAccountKeys().get(1)?.toString();
        if (recipientAddress !== PARENT_WALLET_ADDRESS) {
            return res.status(411).json({ message: "Transaction sent to wrong address" });
        }

        // Check if the sender matches the user's wallet address
        const senderAddress = transaction?.transaction.message.getAccountKeys().get(0)?.toString();
        if (senderAddress !== user.address) {
            return res.status(411).json({ message: "Transaction sent from wrong address" });
        }

        // Update task status and store the transaction signature in the database
        const taskStatus = await prisma.task.update({
            where: { id: taskId },
            data: {
                signature: signature,
                status: TaskStatus.Active,  // Assuming "ACTIVE" is the correct status in your schema
            },
        });

        console.log({ taskStatus });

        // Return success response
        return res.status(200).json({ message: "Transaction added successfully", taskStatus });
    } catch (error) {
        console.error("Error processing task:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
export default router;