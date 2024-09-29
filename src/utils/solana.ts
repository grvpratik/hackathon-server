import { Connection, PublicKey, TransactionResponse } from "@solana/web3.js"; 
import { PARENT_WALLET_ADDRESS, RPC_URL } from "../config/constant";

const connection = new Connection(RPC_URL);

export async function verifyTransaction(signature: string, senderAddress: string): Promise<boolean> {
    const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 1
    });

    if (!transaction) {
        return false;
    }

    const transferredAmount = (transaction.meta?.postBalances[1] ?? 0) - (transaction.meta?.preBalances[1] ?? 0);
    if (transferredAmount !== 100000000) {
        return false;
    }

    const recipientAddress = transaction.transaction.message.getAccountKeys().get(1)?.toString();
    if (recipientAddress !== PARENT_WALLET_ADDRESS) {
        return false;
    }

    const actualSenderAddress = transaction.transaction.message.getAccountKeys().get(0)?.toString();
    if (actualSenderAddress !== senderAddress) {
        return false;
    }

    return true;
}