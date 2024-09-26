import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from './routes/user';
import payerRouter from './routes/payer';
import { PrismaClient } from "@prisma/client";
import { defaultErrorMiddleware } from "./middleware";
import taskRouter from "./routes/tasks";

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

app.use("/v1/tasks", taskRouter);
app.use("/v1/user", userRouter);
app.use("/v1/payer", payerRouter);

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