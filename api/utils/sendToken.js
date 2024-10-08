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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
/**
 * Converts token amount from decimal representation to raw units
 * @param {number} amount - Amount in decimal representation (e.g., 1.5)
 * @param {number} decimals - Number of decimals for the token
 * @returns {bigint} Amount in raw units
 */
function convertToRawAmount(amount, decimals) {
    return BigInt(Math.round(amount * 10 ** decimals));
}
const sendToken = (_a) => __awaiter(void 0, [_a], void 0, function* ({ connection, senderKeypair, recipientAddress, tokenMintAddress, amount, }) {
    try {
        const recipientPublicKey = new web3_js_1.PublicKey(recipientAddress);
        const tokenMintPublicKey = new web3_js_1.PublicKey(tokenMintAddress);
        // Fetch mint info to get decimals
        const mintInfo = yield (0, spl_token_1.getMint)(connection, tokenMintPublicKey);
        // Convert amount to raw units based on token decimals
        const rawAmount = convertToRawAmount(amount, mintInfo.decimals);
        // Get the token accounts
        const senderTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(tokenMintPublicKey, senderKeypair.publicKey);
        const recipientTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(tokenMintPublicKey, recipientPublicKey);
        const transaction = new web3_js_1.Transaction();
        // Check if recipient token account exists
        const recipientTokenAccountInfo = yield connection.getAccountInfo(recipientTokenAccount);
        if (!recipientTokenAccountInfo) {
            transaction.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(senderKeypair.publicKey, recipientTokenAccount, recipientPublicKey, tokenMintPublicKey));
        }
        // Add transfer instruction with raw amount
        transaction.add((0, spl_token_1.createTransferInstruction)(senderTokenAccount, recipientTokenAccount, senderKeypair.publicKey, rawAmount));
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [senderKeypair]);
        return { signature };
    }
    catch (error) {
        console.error('Error sending token:', error);
        throw error;
    }
});
exports.sendToken = sendToken;
