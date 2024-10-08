import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    createTransferInstruction,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getMint,
} from '@solana/spl-token';

/**
 * Converts token amount from decimal representation to raw units
 * @param {number} amount - Amount in decimal representation (e.g., 1.5)
 * @param {number} decimals - Number of decimals for the token
 * @returns {bigint} Amount in raw units
 */
function convertToRawAmount(amount: number, decimals: number) {
    return BigInt(Math.round(amount * 10 ** decimals));
}

/**
 * Sends Solana tokens or meme coins to a specified address
 * @param {Object} params - The parameters for the transfer
 * @param {Connection} params.connection - Solana connection instance
 * @param {Keypair} params.senderKeypair - Sender's keypair
 * @param {string} params.recipientAddress - Recipient's public key as string
 * @param {string} params.tokenMintAddress - Token mint address as string
 * @param {number} params.amount - Amount to send in decimal representation
 * @returns {Promise<string>} Transaction signature
 */


export interface TokenSenderParams {
    /**
     * Solana connection instance
     * @example
     * const connection = new Connection('https://api.mainnet-beta.solana.com');
     */
    connection: Connection;

    /**
     * Keypair of the sender's wallet
     * @example
     * const senderKeypair = Keypair.fromSecretKey(secretKeyUint8Array);
     */
    senderKeypair: Keypair;

    /**
     * Public key of the recipient as string
     * @example
     * const recipientAddress = '7EtCZWtU9rGwZxfG8hQyQEuJ419gFP1Y1qr8vvYWNe6H';
     */
    recipientAddress: string;

    /**
     * Mint address of the token to be sent
     * @example
     * // USDC mint address
     * const tokenMintAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
     */
    tokenMintAddress: string;

    /**
     * Amount of tokens to send in decimal format
     * Will be converted to raw units based on token decimals
     * @example
     * // To send 10.5 USDC
     * const amount = 10.5;
     */
    amount: number;
}

/**
 * Interface for the return value of the token sender function
 */
export interface TokenSenderResult {

    signature: string;


}

/**
 * Function type definition for the token sender
 */
export type TokenSenderFunction = (params: TokenSenderParams) => Promise<TokenSenderResult>;

export const sendToken: TokenSenderFunction = async ({
    connection,
    senderKeypair,
    recipientAddress,
    tokenMintAddress,
    amount,
}): Promise<TokenSenderResult> => {
    try {
        const recipientPublicKey = new PublicKey(recipientAddress);
        const tokenMintPublicKey = new PublicKey(tokenMintAddress);

        // Fetch mint info to get decimals
        const mintInfo = await getMint(connection, tokenMintPublicKey);

        // Convert amount to raw units based on token decimals
        const rawAmount = convertToRawAmount(amount, mintInfo.decimals);

        // Get the token accounts
        const senderTokenAccount = await getAssociatedTokenAddress(
            tokenMintPublicKey,
            senderKeypair.publicKey
        );

        const recipientTokenAccount = await getAssociatedTokenAddress(
            tokenMintPublicKey,
            recipientPublicKey
        );

        const transaction = new Transaction();

        // Check if recipient token account exists
        const recipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
        if (!recipientTokenAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    senderKeypair.publicKey,
                    recipientTokenAccount,
                    recipientPublicKey,
                    tokenMintPublicKey
                )
            );
        }

        // Add transfer instruction with raw amount
        transaction.add(
            createTransferInstruction(
                senderTokenAccount,
                recipientTokenAccount,
                senderKeypair.publicKey,
                rawAmount
            )
        );

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [senderKeypair]
        );

        return { signature };
    } catch (error) {
        console.error('Error sending token:', error);
        throw error;
    }
}