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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.createRewardTiers = createRewardTiers;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const telegram_route_1 = __importDefault(require("./routes/telegram.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const task_route_1 = __importDefault(require("./routes/task.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const game_route_1 = __importDefault(require("./routes/game.route"));
const wallet_route_1 = __importDefault(require("./routes/wallet.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
exports.prisma = new client_1.PrismaClient();
exports.prisma.$connect().then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
});
app.use("/v2/telegram", telegram_route_1.default); //for payer to create task and user to verify task
app.use("/v2/user", user_route_1.default); //user create,user task,user profile
app.use("/v2/task", task_route_1.default); //user task submittion
app.use("/v2/game", game_route_1.default); //user task submittion
app.use("/v2/wallet", wallet_route_1.default);
function createRewardTiers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseReward = yield exports.prisma.rewardTier.create({
                data: {
                    name: 'base',
                    tokenAmount: 100,
                    tokenContract: 'BaseTokenContractAddress',
                    baseDropRate: 0.97, // 97% chance
                    levelScalingFactor: 0.1,
                }
            });
            const silverReward = yield exports.prisma.rewardTier.create({
                data: {
                    name: 'silver',
                    tokenAmount: 2000,
                    tokenContract: 'SilverTokenContractAddress',
                    baseDropRate: 0.02, // 2% chance
                    levelScalingFactor: 0.2,
                }
            });
            const goldReward = yield exports.prisma.rewardTier.create({
                data: {
                    name: 'gold',
                    tokenAmount: 3000,
                    tokenContract: 'GoldTokenContractAddress',
                    baseDropRate: 0.01, // 1% chance
                    levelScalingFactor: 0.3,
                }
            });
            const diamondReward = yield exports.prisma.rewardTier.create({
                data: {
                    name: 'diamond',
                    tokenAmount: 5000,
                    tokenContract: 'DiamondTokenContractAddress',
                    baseDropRate: 0.005, // 0.5% chance
                    levelScalingFactor: 0.4,
                }
            });
            return { baseReward, silverReward, goldReward, diamondReward };
        }
        catch (error) {
            console.error('Error creating reward tiers:', error);
            throw new Error('Could not create reward tiers');
        }
    });
}
app.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { baseReward, silverReward, goldReward, diamondReward } = await createRewardTiers();
        // // Now, create the dungeon using the reward tier IDs
        // const dungeon = await prisma.dungeon.create({
        //     data: {
        //         name: "Fiaona hunt",
        //         description: "A mysterious cave filled with unknown dangers.",
        //         token_ca:"0x7E7Ef0ee0305c1C195fcAe22FD7b207a813EEF86",
        //         entryPoints: 100,       // Tokens required to enter
        //         timeToComplete: 36,   // Time to complete (in seconds)
        //         minimumLevel: 0,        // Minimum level required to enter
        //         baseRewardId: baseReward.id,  // Use the created base reward ID
        //         silverRewardId: silverReward.id, // Use the created silver reward ID
        //         goldRewardId: goldReward.id, // Use the created gold reward ID
        //         diamondRewardId: diamondReward.id, // Use the created diamond reward ID
        //         isActive: true,
        //     }
        // });
        // console.log('Dungeon created:', dungeon);
        res.status(200).json();
    }
    catch (error) {
        next(error);
    }
}));
// This should be after all routes
app.use(error_middleware_1.defaultErrorMiddleware);
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
    process.exit();
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server 💽 listening on PORT ${PORT}`);
});
exports.default = app;
