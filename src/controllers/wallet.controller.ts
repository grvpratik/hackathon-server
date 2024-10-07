import { NextFunction, Request, Response } from 'express';
import nacl from 'tweetnacl';
import { PublicKey } from "@solana/web3.js";
import { PayerService } from '../services/payer.service';
const SIGNIN_MESSAGE="WELCOME TO SOCIAL HUNT"
export const WalletController = {
    async addWalletPayer(req: Request, res: Response,next:NextFunction) {
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
        try {
            // @ts-ignore
            const payerId: string = req.payerId;
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

            const updated = await PayerService.updatePayerWallet(payerId, publicKey);
            console.log({ updated });

            return res.status(200).json({ message: "Wallet added successfully" });
        } catch (error) {
            console.error('Error adding wallet:', error);
            next(error)
        }
    }
};