// const TelegramBot = require("node-telegram-bot-api");
// const token = "6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc";
// const bot = new TelegramBot(token, { polling: true });

// // Handle /start command
// let submissions = {};

// bot.onText(/\/start (.+)/, (msg, match) => {
// 	const chatId = msg.chat.id;
// 	const submissionId = match[1];

// 	// Store the active submission for this chat
// 	submissions[chatId] = { id: submissionId, status: "pending" };

// 	bot.sendMessage(
// 		chatId,
// 		`Ready to receive proof for submission ${submissionId}. Please send a photo.`
// 	);
// });

// bot.on("photo", (msg) => {
// 	const chatId = msg.chat.id;

// 	if (submissions[chatId] && submissions[chatId].status === "pending") {
// 		const submissionId = submissions[chatId].id;
// 		const fileId = msg.photo[msg.photo.length - 1].file_id;

// 		// In a real application, you'd save this file_id to your database
// 		submissions[chatId].status = "completed";
// 		submissions[chatId].proofFileId = fileId;

// 		bot.sendMessage(
// 			chatId,
// 			`Thank you! Proof received for submission ${submissionId}.`
// 		);

// 		// Here you would update your actual database with the proof
// 		console.log(`Submission ${submissionId} completed with proof ${fileId}`);
// 	} else {
// 		bot.sendMessage(
// 			chatId,
// 			"I'm not expecting a proof from you right now. Please start a task first."
// 		);
// 	}
// });

// bot.on("message", (msg) => {
// 	const chatId = msg.chat.id;

// 	if (!msg.photo) {
// 		bot.sendMessage(
// 			chatId,
// 			"I'm expecting a photo as proof. Please send a photo."
// 		);
// 	}
// });

// console.log("Bot is running...");

// // Log errors
// bot.on("polling_error", (error) => {
// 	console.log(error.code); // E.g., 'EFATAL'
// });











const web3 = require("@solana/web3.js");

// Use your existing secret key to fund the new wallet
const DEMO_FROM_SECRET_KEY = new Uint8Array([
	28, 253, 49, 114, 139, 198, 236, 139, 77, 16, 16, 189, 135, 214, 161, 244,
	139, 34, 170, 29, 5, 253, 213, 148, 226, 165, 124, 241, 136, 0, 6, 110, 224,
	165, 135, 90, 197, 24, 202, 167, 254, 66, 138, 37, 130, 50, 254, 179, 95, 208,
	245, 47, 90, 226, 59, 175, 183, 65, 152, 236, 60, 133, 254, 203,
]);

(async () => {
	// Connect to the Solana devnet
	const connection = new web3.Connection(
		web3.clusterApiUrl("devnet"),
		"confirmed"
	);

	// Construct a `Keypair` from the provided secret key
	const from = web3.Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
	const balance = await connection.getBalance(new web3.PublicKey(from.publicKey));
	console.log(balance)
	// // Generate a new wallet (Keypair)
	// const newWallet = web3.Keypair.generate();
	// const publicKey = newWallet.publicKey.toString();
	// const privateKey = newWallet.secretKey.toString();

	// // Log the new wallet's public and private key
	// console.log("New Wallet Public Key:", publicKey);
	// console.log("New Wallet Private Key:", privateKey);

	// User-provided recipient wallet address (replace this with the user's wallet)
	const userProvidedWallet = "HnAAowqiYgy9y5VGo585hEHwh8JKEShV7Dozf4LUc4wp";

	// Add a transfer instruction to the transaction (send 0.01 SOL)
	const transaction = new web3.Transaction().add(
		web3.SystemProgram.transfer({
			fromPubkey: from.publicKey,
			toPubkey: new web3.PublicKey(userProvidedWallet),
			lamports: web3.LAMPORTS_PER_SOL / 100, // 0.01 SOL
		})
	);

	// Sign the transaction and send it
	try {
		const signature = await web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[from]
		);
		console.log("Transaction Signature:", signature);
		console.log("Transfer Success");
	} catch (error) {
		console.error("Error during transfer:", error);
	}
})();
