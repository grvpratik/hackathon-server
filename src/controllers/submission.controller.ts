


import { ImageService } from "../services/image.service";
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ProofService } from "../services/proof.service";
import { sendMessage } from "../services/telegram.service";
import { getInitData } from "../middlewares/user.middleware";

const POINTS=200
export async function handleVerifySubmission(req: Request, res: Response,next:NextFunction) {
    try {
        const body = req.body;
        // console.log('Received Telegram update:', JSON.stringify(body, null, 2));

        const { message, callback_query } = body;

        if (message.photo && message.chat.id) {
            ImageService.handleImage(message.chat.id, message.photo)
        }

    } catch (error) {
        console.error('Error processing Telegram update:', error);
        next(error);
    }



}

export async function usertaskSubmission(req: Request, res: Response,next:NextFunction) {
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


        await sendMessage(chatId, `Successfully created submission\nID: ${submission.id}\nPlease upload your proof.`);
        return res.status(201).json({ submissionId: submission.id });





    }
    catch (error) {
        console.error('Error processing Telegram update:', error);
        next(error);
    }

}