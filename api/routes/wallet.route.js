"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payer_middleware_1 = require("../middlewares/payer.middleware");
const user_middleware_1 = require("../middlewares/user.middleware");
const walletRoute = (0, express_1.Router)();
walletRoute.post('/payer/connect', payer_middleware_1.authMiddleware);
walletRoute.post('/payer/payment', payer_middleware_1.authMiddleware);
//connect
//1 payer
//2 user
walletRoute.post('/user/connect', user_middleware_1.userMiddleware);
walletRoute.post('/user/payment', user_middleware_1.userMiddleware);
//payment
//1 payer
//2 user
exports.default = walletRoute;
