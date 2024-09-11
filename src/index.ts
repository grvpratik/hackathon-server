import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();




const app: Express = express();

app.use(express.json());

app.use(cors<Request>());



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

app.listen(process.env.PORT, () => {
    console.log(`Server 💽 listening on PORT ${process.env.PORT}`);
});

export default app;