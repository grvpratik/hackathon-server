const TelegramBot = require("node-telegram-bot-api");
const token = "6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc";
const bot = new TelegramBot(token, { polling: true });

// Handle /start command
let submissions = {};

bot.onText(/\/start (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const submissionId = match[1];

	// Store the active submission for this chat
	submissions[chatId] = { id: submissionId, status: "pending" };

	bot.sendMessage(
		chatId,
		`Ready to receive proof for submission ${submissionId}. Please send a photo.`
	);
});

bot.on("photo", (msg) => {
	const chatId = msg.chat.id;

	if (submissions[chatId] && submissions[chatId].status === "pending") {
		const submissionId = submissions[chatId].id;
		const fileId = msg.photo[msg.photo.length - 1].file_id;

		// In a real application, you'd save this file_id to your database
		submissions[chatId].status = "completed";
		submissions[chatId].proofFileId = fileId;

		bot.sendMessage(
			chatId,
			`Thank you! Proof received for submission ${submissionId}.`
		);

		// Here you would update your actual database with the proof
		console.log(`Submission ${submissionId} completed with proof ${fileId}`);
	} else {
		bot.sendMessage(
			chatId,
			"I'm not expecting a proof from you right now. Please start a task first."
		);
	}
});

bot.on("message", (msg) => {
	const chatId = msg.chat.id;

	if (!msg.photo) {
		bot.sendMessage(
			chatId,
			"I'm expecting a photo as proof. Please send a photo."
		);
	}
});

console.log("Bot is running...");

// Log errors
bot.on("polling_error", (error) => {
	console.log(error.code); // E.g., 'EFATAL'
});
