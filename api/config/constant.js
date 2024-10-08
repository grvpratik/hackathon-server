"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_RPC_ENDPOINTS = exports.RPC_ENDPOINT = exports.TELEGRAM_USER_API_URL = exports.TELEGRAM_API_URL = exports.TELEGRAM_BOT_USER_TOKEN = exports.TELEGRAM_BOT_TOKEN = exports.TOTAL_DECIMALS = exports.RPC_URL = exports.PARENT_WALLET_ADDRESS = exports.BASE_URL = exports.SECRET_KEY = void 0;
exports.SECRET_KEY = 'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2';
exports.BASE_URL = "https://twa-lake.vercel.app/payment";
exports.PARENT_WALLET_ADDRESS = "j1oAbxxiDUWvoHxEDhWE7THLjEkDQW2cSHYn2vttxTF";
exports.RPC_URL = (_a = process.env.RPC_URL) !== null && _a !== void 0 ? _a : "https://api.devnet.solana.com";
exports.TOTAL_DECIMALS = 1000000;
exports.TELEGRAM_BOT_TOKEN = "6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc";
exports.TELEGRAM_BOT_USER_TOKEN = "7041386853:AAEW5znTrN0WavEQPnOar-9puS98r5Zw_hU";
exports.TELEGRAM_API_URL = `https://api.telegram.org/bot${exports.TELEGRAM_BOT_TOKEN}`;
exports.TELEGRAM_USER_API_URL = `https://api.telegram.org/bot${exports.TELEGRAM_BOT_USER_TOKEN}`;
exports.RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
exports.FALLBACK_RPC_ENDPOINTS = [
    "https://solana-api.projectserum.com",
    "https://solana-mainnet.g.alchemy.com/v2/bhRrhVHo4H_1Sb2uGRFcELTHgLvML9hW",
];
