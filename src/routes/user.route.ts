import { Router } from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import { userAuthentication, userInfo, userTaskList, userVerification } from "../controllers/user.controller";



const userRoute = Router();

userRoute.post('/auth/session',userMiddleware,userAuthentication)
userRoute.post('/auth/verify', userMiddleware, userVerification)
userRoute.get('/task', userMiddleware, userTaskList)

userRoute.post('/me', userMiddleware, userInfo)


export default userRoute;