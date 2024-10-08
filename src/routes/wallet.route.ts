import { Router } from "express";
import { authMiddleware } from "../middlewares/payer.middleware";
import { userMiddleware } from "../middlewares/user.middleware";
import { WalletController } from "../controllers/wallet.controller";


const walletRoute = Router()

walletRoute.post('/payer/connect', authMiddleware,WalletController.addWalletPayer)
walletRoute.post('/payer/payment', authMiddleware,WalletController.verifyPaymentPayer)
//connect
//1 payer
//2 user
walletRoute.post('/user/connect', WalletController.addWalletUser)
walletRoute.post('/user/payment', userMiddleware)
//payment
//1 payer
//2 user


export default walletRoute;