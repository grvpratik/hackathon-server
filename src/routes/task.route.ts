import { Router } from "express";
import { userMiddleware } from "../middleware";
import { usertaskSubmission } from "../controllers/submission.controller";

const taskRoute = Router();


taskRoute.post('/:taskId/submit',userMiddleware,usertaskSubmission)

export default taskRoute;