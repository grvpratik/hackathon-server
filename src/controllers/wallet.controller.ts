import { NextFunction, Request, Response } from 'express';
import nacl from 'tweetnacl';
import { PublicKey } from "@solana/web3.js";
import { PayerService } from '../services/payer.service';

export const WalletController = {
    async addWallet(req: Request, res: Response,next:NextFunction) {
        try {
            // @ts-ignore
            const payerId: string = req.payerId;
            const { signature, publicKey } = req.body;

            if (!payerId) {
                return res.status(400).json({ message: "Payer ID is required" });
            }

            const message = new TextEncoder().encode("Sign into mechanical turks");

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