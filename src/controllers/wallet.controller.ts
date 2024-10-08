import { NextFunction, Request, Response } from 'express';
import nacl from 'tweetnacl';
import { PublicKey } from "@solana/web3.js";
import { PayerService } from '../services/payer.service';
import { UserService } from '../services/user.service';
import { verifyTransaction } from '../utils/solana';
import { jwtVerify } from 'jose';
import { verifySessionToken } from '../utils/jwt';
const SIGNIN_MESSAGE = "WELCOME TO SOCIAL HUNT"
export const WalletController = {
    async addWalletPayer(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore
            const payerId: string = req.payerId;
            const { signature, publicKey } = req.body;

            if (!payerId) {
                return res.status(400).json({ message: "Payer ID is required" });
            }

            const message = new TextEncoder().encode(SIGNIN_MESSAGE);

            const result = nacl.sign.detached.verify(
                message,
                new Uint8Array(signature.data),
                new PublicKey(publicKey).toBytes(),
            );

            if (!result) {
                return res.status(411).json({ message: "Incorrect signature" });
            }

            const updated = await PayerService.updatePayerWallet(payerId, publicKey);
            console.log({ updated });

            return res.status(200).json({ message: "Wallet added successfully" });
        } catch (error) {
            console.error('Error adding wallet:', error);
            next(error)
        }
    }, async addWalletUser(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers["authorization"] ?? "";
        // console.log({authHeader})
        // Early return if authorization header is missing
        if (!authHeader) {
            return res.status(403).json({ message: "You are not logged in" });
        }
        const payload = await verifySessionToken(authHeader)
        if (!payload) {
            res.status(403).json({
                success: false,
                message:"verification failed"
            })
            return
        }
        try {
            // @ts-ignore
          
            const { signature, publicKey } = req.body;



            const message = new TextEncoder().encode(SIGNIN_MESSAGE);

            const result = nacl.sign.detached.verify(
                message,
                new Uint8Array(signature.data),
                new PublicKey(publicKey).toBytes(),
            );

            if (!result) {
                return res.status(411).json({ message: "Incorrect signature" });
            }

            const updated = await UserService.updataUserAddress(payload.id as any, publicKey);
            console.log({ updated });

            return res.status(200).json({ message: "Wallet added successfully" });
        } catch (error) {
            console.error('Error adding wallet:', error);
            next(error)
        }
    },
    async verifyPaymentPayer(req: Request, res: Response, next: NextFunction) {
        // @ts-ignore
        const taskId: string = req.taskId;
        // @ts-ignore
        const userId = req.userId;
        // @ts-ignore
        const amount = req.amount;
        const { signature } = req.body;
        // Fetch the user based on userId
        const user = await UserService.checkUser(userId);

        // Early return if user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { success, message } = await verifyTransaction(signature, user.address!,amount!)

        if (!success) {
            res.status(400).json({
                success,
                message

            })
            return
        } else {
            res.status(200).json({
                success,
                message

            })
        }
    }
};