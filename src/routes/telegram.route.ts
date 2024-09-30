import { Router } from "express";
import { handleCreateRequest } from "../controllers/create.controller";
import { handleVerifySubmission } from "../controllers/submission.controller";




const telegramRoute = Router();


telegramRoute.post('/create', handleCreateRequest);

telegramRoute.post('/verify', handleVerifySubmission)









export default telegramRoute;