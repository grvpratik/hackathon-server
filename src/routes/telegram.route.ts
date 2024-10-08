import { NextFunction, Router } from "express";
import { handleCreateRequest } from "../controllers/create.controller";
import { handleVerifySubmission } from "../controllers/submission.controller";
import axios from "axios";
import { sendReplyUser } from "../services/telegram.service";


export async function testRoute(req: Request, res: Response, next: NextFunction) {
    
 }

const telegramRoute = Router();

//creeate task for user via payer
telegramRoute.post('/create', handleCreateRequest);
//verify the task submitted by user
telegramRoute.post('/verify', handleVerifySubmission)



export default telegramRoute;


// const TELEGRAM_BOT_USER_TOKEN = process.env.TELEGRAM_BOT_USER_TOKEN;
// const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_USER_TOKEN}`;

// telegramRoute.post('/test', async (req, res) => {
//     try {
//         const { message } = req.body;

//         if (message) {
//             const chatId = message.chat.id;
//             const receivedText = message.text;

//             // Process the received message and prepare response
//             const responseText = `Received your message: ${receivedText}`;
// try {
//     sendReplyUser(chatId,responseText)
// } catch (error) {
//     sendReplyUser(chatId, responseText)
// }
//           // Send response back to Telegram
           
//         }
//         res.sendStatus(200);
//     } catch (error) {
//         console.error('Error processing webhook:', error);

//         res.sendStatus(500);
//     }
// })











// export default telegramRoute;