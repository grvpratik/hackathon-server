import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";


import telegramRoute from "./routes/telegram.route";
import userRoute from "./routes/user.route";
import taskRoute from "./routes/task.route";
import { defaultErrorMiddleware } from "./middlewares/error.middleware";
import gameRoute from "./routes/game.route";
import walletRoute from "./routes/wallet.route";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cors<Request>());

export const prisma = new PrismaClient();

prisma.$connect().then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
});


app.use("/v2/telegram", telegramRoute) //for payer to create task and user to verify task
app.use("/v2/user", userRoute) //user create,user task,user profile
app.use("/v2/task", taskRoute)//user task submittion
app.use("/v2/game", gameRoute)//user task submittion
app.use("/v2/wallet", walletRoute)
export async function createRewardTiers() {
    try {
        const baseReward = await prisma.rewardTier.create({
            data: {
                name: 'base',
                tokenAmount: 100,
                tokenContract: 'BaseTokenContractAddress',
                baseDropRate: 0.97,  // 97% chance
                levelScalingFactor: 0.1,
            }
        });

        const silverReward = await prisma.rewardTier.create({
            data: {
                name: 'silver',
                tokenAmount: 2000,
                tokenContract: 'SilverTokenContractAddress',
                baseDropRate: 0.02,  // 2% chance
                levelScalingFactor: 0.2,
            }
        });

        const goldReward = await prisma.rewardTier.create({
            data: {
                name: 'gold',
                tokenAmount: 3000,
                tokenContract: 'GoldTokenContractAddress',
                baseDropRate: 0.01,  // 1% chance
                levelScalingFactor: 0.3,
            }
        });

        const diamondReward = await prisma.rewardTier.create({
            data: {
                name: 'diamond',
                tokenAmount: 5000,
                tokenContract: 'DiamondTokenContractAddress',
                baseDropRate: 0.005,  // 0.5% chance
                levelScalingFactor: 0.4,
            }
        });

        return { baseReward, silverReward, goldReward, diamondReward };
    } catch (error) {
        console.error('Error creating reward tiers:', error);
        throw new Error('Could not create reward tiers');
    }
}
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { baseReward, silverReward, goldReward, diamondReward } = await createRewardTiers();

        // Now, create the dungeon using the reward tier IDs
        const dungeon = await prisma.dungeon.create({
            data: {
                name: "Fiaona hunt",
                description: "A mysterious cave filled with unknown dangers.",
                token_ca:"0x7E7Ef0ee0305c1C195fcAe22FD7b207a813EEF86",
                entryPoints: 100,       // Tokens required to enter
                timeToComplete: 36,   // Time to complete (in seconds)
                minimumLevel: 0,        // Minimum level required to enter
                baseRewardId: baseReward.id,  // Use the created base reward ID
                silverRewardId: silverReward.id, // Use the created silver reward ID
                goldRewardId: goldReward.id, // Use the created gold reward ID
                diamondRewardId: diamondReward.id, // Use the created diamond reward ID
                isActive: true,
            }
        });

        console.log('Dungeon created:', dungeon);
        


        res.status(200).json(dungeon);
    } catch (error) {
        next(error);
    }
});

// This should be after all routes
app.use(defaultErrorMiddleware);

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server 💽 listening on PORT ${PORT}`);
});

export default app;