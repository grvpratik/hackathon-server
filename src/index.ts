import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from './routes/user'
import payerRouter from './routes/payer'
import { PrismaClient } from "@prisma/client";



dotenv.config();

const app: Express = express();

app.use(express.json());

app.use(cors<Request>());
export const prisma = new PrismaClient();


prisma.$transaction(
    async (prisma) => {
        // Code running in a transaction...
    },
    {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
    }
)
app.use("/v1/user", userRouter);
app.use("/v1/payer",payerRouter)

app.get("/", async (req: Request, res: Response) => {
    try {
        res.status(200).send("get request here");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
    return;
});

// app.use(errorMiddleware);
process.on('SIGINT', () => {
    prisma.$disconnect();
    process.exit();
});
app.listen(process.env.PORT, () => {
    console.log(`Server 💽 listening on PORT ${process.env.PORT}`);
});

export default app;