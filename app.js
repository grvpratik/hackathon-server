const TelegramBot = require("node-telegram-bot-api");
const token = "6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc";
const bot = new TelegramBot(token, { polling: true });

// Handle /start command
bot.onText(/\/test/, (msg) => {
	const chatId = msg.chat.id;

	// Send initial options
	bot.sendMessage(chatId, "Choose an option:", {
		reply_markup: {
			inline_keyboard: [
				[{ text: "Option 1", callback_data: "option1" }],
				[{ text: "Option 2", callback_data: "option2" }],
			],
		},
	});
});

// Handle button presses (callback queries)
bot.on("callback_query", (callbackQuery) => {
	const msg = callbackQuery.message;
	const chatId = msg.chat.id;
	const data = callbackQuery.data;

	if (data === "option1") {
		// User selected "Option 1"
		bot.sendMessage(chatId, "You chose Option 1. Now pick a sub-option:", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Sub-option A", callback_data: "suboption_a" }],
					[{ text: "Sub-option B", callback_data: "suboption_b" }],
				],
			},
		});
	} else if (data === "option2") {
		// User selected "Option 2"
		bot.sendMessage(chatId, "You chose Option 2. Now pick a sub-option:", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Sub-option C", callback_data: "suboption_c" }],
					[{ text: "Sub-option D", callback_data: "suboption_d" }],
				],
			},
		});
	} else if (data === "suboption_a") {
		// User selected "Sub-option A"
		bot.sendMessage(chatId, "You picked Sub-option A.");
	} else if (data === "suboption_b") {
		// User selected "Sub-option B"
		bot.sendMessage(chatId, "You picked Sub-option B.");
	} else if (data === "suboption_c") {
		// User selected "Sub-option C"
		bot.sendMessage(chatId, "You picked Sub-option C.");
	} else if (data === "suboption_d") {
		// User selected "Sub-option D"
		bot.sendMessage(chatId, "You picked Sub-option D.");
	}
});

// Log errors
bot.on("polling_error", (error) => {
	console.log(error.code); // E.g., 'EFATAL'
});
