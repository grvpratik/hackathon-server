import { Router } from "express";

import { usertaskSubmission } from "../controllers/submission.controller";
import { userMiddleware } from "../middlewares/user.middleware";

const taskRoute = Router();


taskRoute.post('/:taskId/submit',userMiddleware,usertaskSubmission)

export default taskRoute;