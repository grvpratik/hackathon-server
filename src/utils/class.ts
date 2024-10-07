import { Connection, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";


interface TokenTransferResult {
    success: boolean;
    signature?: string;
    error?: string;
}
class SolanaTokenTransfer {
    private connection: Connection;
    private parentWallet: any; // Replace with actual wallet type

    constructor(
        endpoint: string,
        parentWalletSecret: string // Ensure this is securely managed
    ) {
        this.connection = new Connection(endpoint, 'confirmed');
        this.parentWallet = null; // Initialize wallet using parentWalletSecret
    }

    async sendToken(
        tokenMint: string,
        recipientAddress: string,
        amount: number
    ): Promise<TokenTransferResult> {
        try {
            const recipientPublicKey = new PublicKey(recipientAddress);
            const tokenPublicKey = new PublicKey(tokenMint);

            const token = new Token(
                this.connection,
                tokenPublicKey,
                TOKEN_PROGRAM_ID,
                this.parentWallet
            );

            // Get or create associated token account
            const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(
                recipientPublicKey
            );

            // Create transfer instruction
            const transaction = new Transaction().add(
                Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    this.parentWallet.publicKey,
                    recipientTokenAccount.address,
                    this.parentWallet.publicKey,
                    [],
                    amount
                )
            );

            // Send transaction
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [this.parentWallet]
            );

            return {
                success: true,
                signature
            };
        } catch (error) {
            console.error('Token transfer failed:', error);
            return {
                success: false,
                error: error?.message
            };
        }
    }
}