export const SECRET_KEY = process.env.SECRET_KEY;
export const BASE_URL = "https://twa-lake.vercel.app/payment";
export const PARENT_WALLET_ADDRESS = "j1oAbxxiDUWvoHxEDhWE7THLjEkDQW2cSHYn2vttxTF";
export const RPC_URL = process.env.RPC_URL ?? "https://api.devnet.solana.com";
export const TOTAL_DECIMALS = 1000_000;


export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_BOT_USER_TOKEN = process.env.TELEGRAM_BOT_USER_TOKEN;
export const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN!}`;
export const TELEGRAM_USER_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_USER_TOKEN!}`;

export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
export const FALLBACK_RPC_ENDPOINTS = [
    "https://solana-api.projectserum.com",
    "https://solana-mainnet.g.alchemy.com/v2/bhRrhVHo4H_1Sb2uGRFcELTHgLvML9hW",
];