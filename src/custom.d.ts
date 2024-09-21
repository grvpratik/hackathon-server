import { Request } from "express";

declare module "express" {
    interface Request {
        payerId?: string;
        taskId?: string;
    }
}
