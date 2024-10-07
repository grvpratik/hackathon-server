import { Router } from "express";
import { authMiddleware } from "../middlewares/payer.middleware";
import { userMiddleware } from "../middlewares/user.middleware";


const walletRoute = Router()

walletRoute.post('/payer/connect', authMiddleware)
walletRoute.post('/payer/payment', authMiddleware)
//connect
//1 payer
//2 user
walletRoute.post('/user/connect', userMiddleware)
walletRoute.post('/user/payment', userMiddleware)
//payment
//1 payer
//2 user


export default walletRoute;