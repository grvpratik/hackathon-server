"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const web3_js_1 = require("@solana/web3.js");
const payer_service_1 = require("../services/payer.service");
const user_service_1 = require("../services/user.service");
const solana_1 = require("../utils/solana");
const jwt_1 = require("../utils/jwt");
const SIGNIN_MESSAGE = "WELCOME TO SOCIAL HUNT";
exports.WalletController = {
    addWalletPayer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const payerId = req.payerId;
                const { signature, publicKey } = req.body;
                if (!payerId) {
                    return res.status(400).json({ message: "Payer ID is required" });
                }
                const message = new TextEncoder().encode(SIGNIN_MESSAGE);
                const result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(signature.data), new web3_js_1.PublicKey(publicKey).toBytes());
                if (!result) {
                    return res.status(411).json({ message: "Incorrect signature" });
                }
                const updated = yield payer_service_1.PayerService.updatePayerWallet(payerId, publicKey);
                console.log({ updated });
                return res.status(200).json({ message: "Wallet added successfully" });
            }
            catch (error) {
                console.error('Error adding wallet:', error);
                next(error);
            }
        });
    }, addWalletUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
            // console.log({authHeader})
            // Early return if authorization header is missing
            if (!authHeader) {
                return res.status(403).json({ message: "You are not logged in" });
            }
            const payload = yield (0, jwt_1.verifySessionToken)(authHeader);
            if (!payload) {
                res.status(403).json({
                    success: false,
                    message: "verification failed"
                });
                return;
            }
            try {
                // @ts-ignore
                const { signature, publicKey } = req.body;
                const message = new TextEncoder().encode(SIGNIN_MESSAGE);
                const result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(signature.data), new web3_js_1.PublicKey(publicKey).toBytes());
                if (!result) {
                    return res.status(411).json({ message: "Incorrect signature" });
                }
                const updated = yield user_service_1.UserService.updataUserAddress(payload.id, publicKey);
                console.log({ updated });
                return res.status(200).json({ message: "Wallet added successfully" });
            }
            catch (error) {
                console.error('Error adding wallet:', error);
                next(error);
            }
        });
    },
    verifyPaymentPayer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const taskId = req.taskId;
            // @ts-ignore
            const userId = req.userId;
            // @ts-ignore
            const amount = req.amount;
            const { signature } = req.body;
            // Fetch the user based on userId
            const user = yield user_service_1.UserService.checkUser(userId);
            // Early return if user not found
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const { success, message } = yield (0, solana_1.verifyTransaction)(signature, user.address, amount);
            if (!success) {
                res.status(400).json({
                    success,
                    message
                });
                return;
            }
            else {
                res.status(200).json({
                    success,
                    message
                });
            }
        });
    }
};
