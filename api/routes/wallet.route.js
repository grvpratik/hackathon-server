"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payer_middleware_1 = require("../middlewares/payer.middleware");
const user_middleware_1 = require("../middlewares/user.middleware");
const wallet_controller_1 = require("../controllers/wallet.controller");
const walletRoute = (0, express_1.Router)();
walletRoute.post('/payer/connect', payer_middleware_1.authMiddleware, wallet_controller_1.WalletController.addWalletPayer);
walletRoute.post('/payer/payment', payer_middleware_1.authMiddleware, wallet_controller_1.WalletController.verifyPaymentPayer);
//connect
//1 payer
//2 user
walletRoute.post('/user/connect', wallet_controller_1.WalletController.addWalletUser);
walletRoute.post('/user/payment', user_middleware_1.userMiddleware);
//payment
//1 payer
//2 user
exports.default = walletRoute;
