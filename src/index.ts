import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";


import telegramRoute from "./routes/telegram.route";
import userRoute from "./routes/user.route";
import taskRoute from "./routes/task.route";
import { defaultErrorMiddleware } from "./middlewares/error.middleware";
import gameRoute from "./routes/game.route";

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

// app.use("/v1/tasks", taskRouter);
// app.use("/v1/user", userRouter);
// app.use("/v1/payer", payerRouter);
////refactored
app.use("/v2/telegram", telegramRoute) //for payer to create task and user to verify task
app.use("/v2/user", userRoute) //user create,user task,user profile
app.use("/v2/task", taskRoute)//user task submittion
app.use("/v2/game", gameRoute)//user task submittion

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send("get request here");
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