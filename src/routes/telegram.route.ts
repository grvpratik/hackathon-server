import { NextFunction, Router } from "express";
import { handleCreateRequest } from "../controllers/create.controller";
import { handleVerifySubmission } from "../controllers/submission.controller";


export async function testRoute(req: Request, res: Response, next: NextFunction) {
    
 }

const telegramRoute = Router();

//creeate task for user via payer
telegramRoute.post('/create', handleCreateRequest);
//verify the task submitted by user
telegramRoute.post('/verify', handleVerifySubmission)



export default telegramRoute;

