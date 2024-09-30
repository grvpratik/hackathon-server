import { Router } from "express";
import { userMiddleware } from "../middleware";
import { userAuthentication, userInfo, userTaskList } from "../controllers/user.controller";



const userRoute = Router();

userRoute.post('/auth/session',userMiddleware,userAuthentication)

userRoute.get('/task', userMiddleware, userTaskList)

userRoute.get('/me', userMiddleware, userInfo)


export default userRoute;