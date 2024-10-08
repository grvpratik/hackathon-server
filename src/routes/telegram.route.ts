import { NextFunction, Router } from "express";
import { handleCreateRequest } from "../controllers/create.controller";
import { handleVerifySubmission } from "../controllers/submission.controller";
import { imageHandlerChat } from "../temp/image-handler";


export async function testRoute(req: Request, res: Response, next: NextFunction) {

}

const telegramRoute = Router();

//creeate task for user via payer
telegramRoute.post('/create', handleCreateRequest);
//verify the task submitted by user
telegramRoute.post('/verify', handleVerifySubmission)

telegramRoute.post('/image', async (req, res) => {
    console.log("start")
    try {
        const body = req.body;
        console.log('Received Telegram update:', JSON.stringify(body, null, 2));

        const { message, callback_query } = body;

        if (message.photo && message.chat.id) {
            await imageHandlerChat(message.chat.id, message.photo)
        }
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Error processing Telegram update:', error);
        res.status(500).json({ error: 'Server error' });
    }

})


export default telegramRoute;

