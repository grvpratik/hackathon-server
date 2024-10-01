import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

import express, {
    type ErrorRequestHandler,
    type RequestHandler,

} from 'express';
import { SECRET_KEY } from "../config/constant";

const secret = new TextEncoder().encode(
    SECRET_KEY
)
declare module "express" {
    interface Request {
        payerId?: string;
        taskId?: string;
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"] ?? "";
    // console.log({authHeader})
    // Early return if authorization header is missing
    if (!authHeader) {
        return res.status(403).json({ message: "You are not logged in" });
    }

    try {
        // Function to verify JWT token
        const { payload } = await jwtVerify(authHeader, secret);
        if (!payload || !payload.payerId || !payload.taskId) {
            return res.status(403).json({ message: "Invalid token payload" });
        }
        console.log(payload.payerId)
        // Assign values to the extended req properties
        req.payerId = payload.payerId as string;
        req.taskId = payload.taskId as string;
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.log(error)
        return res.status(403).json({ message: "Invalid token" });
    }
}
