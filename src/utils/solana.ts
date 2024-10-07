import { Connection, LAMPORTS_PER_SOL, PublicKey, TransactionResponse } from "@solana/web3.js"; 
import { PARENT_WALLET_ADDRESS, RPC_URL } from "../config/constant";

const connection = new Connection(RPC_URL);

export async function verifyTransaction(signature: string, senderAddress: string,amount:number): Promise<any> {
    const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 1
    });

    if (!transaction) {
        return {success:false,message:"transation not found"};
    }

    const transferredAmount = (transaction.meta?.postBalances[1] ?? 0) - (transaction.meta?.preBalances[1] ?? 0);
    if (transferredAmount !== amount * LAMPORTS_PER_SOL) {
        return { success: false, message: "Transaction signature/amount incorrect" };
    }

    const recipientAddress = transaction.transaction.message.getAccountKeys().get(1)?.toString();
    if (recipientAddress !== PARENT_WALLET_ADDRESS) {
        return { success: false, message: "tTransaction sent to wrong address" };
    }

    const actualSenderAddress = transaction.transaction.message.getAccountKeys().get(0)?.toString();
    if (actualSenderAddress !== senderAddress) {
        return { success: false, message: "Transaction sent from wrong address" };
    }

    return {success:true,message:"completed"}
}