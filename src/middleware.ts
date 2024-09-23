import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { secret } from "./routes/payer";
import { validate, parse, type InitDataParsed } from '@telegram-apps/init-data-node';
import express, {
    type ErrorRequestHandler,
    type RequestHandler,
   
} from 'express';
const token = process.env.TELEGRAM_BOT_TOKEN!;

declare module "express" {
    interface Request {
        payerId?: string;
        taskId?: string;
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"] ?? "";
    console.log({authHeader})
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
        return res.status(403).json({ message: "Invalid token" });
    }
}

function setInitData(res: Response, initData: InitDataParsed): void {
    res.locals.initData = initData;
}

/**
 * Extracts init data from the Response object.
 * @param res - Response object.
 * @returns Init data stored in the Response object. Can return undefined in case,
 * the client is not authorized.
 */
export  function getInitData(res: Response): InitDataParsed | undefined {
    return res.locals.initData;
}

/**
 * Middleware which authorizes the external client.
 * @param req - Request object.
 * @param res - Response object.
 * @param next - function to call the next middleware.
 */
export function userMiddleware(req: Request, res: Response, next: NextFunction) {
   // We expect passing init data in the Authorization header in the following format:
    // <auth-type> <auth-data>
    // <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data.
    const [authType, authData = ''] = (req.header('authorization') || '').split(' ');
console.log({authData})
    switch (authType) {
        case 'tma':
            try {
                console.log({token})
                // Validate init data.
                validate(authData, token, {
                    // We consider init data sign valid for 1 hour from their creation moment.
                    expiresIn: 3600,
                });

                // Parse init data. We will surely need it in the future.
                setInitData(res, parse(authData));
                const initData = parse(authData);
                const currentTime = Math.floor(Date.now() / 1000);
                const authDate = initData.authDate;
              
                // console.log({ x ,currentTime})
                console.log(`Current time: ${currentTime}, Auth date: ${authDate}, `);
                return next();
            } catch (e) {
                console.log("init data")
                console.log(e)
                return res.status(500).json({ message:"Init data expired or invalid"});
            }
        // ... other authorization methods.
        default:
            return next(new Error('Unauthorized'));
    }
}

/**
 * Middleware which displays the user init data.
 * @param err - handled error.
 * @param _req
 * @param res - Response object.
 */
export const defaultErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    console.error("Default error handler caught:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: err.message || 'Internal Server Error',
    });
};