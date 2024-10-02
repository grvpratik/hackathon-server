import { NextFunction, Request, Response } from "express";

import { validate, parse,  } from '@telegram-apps/init-data-node';
import { error } from "console";

const token = process.env.TELEGRAM_BOT_TOKEN!;

declare module "express" {
    interface Request {
        payerId?: string;
        taskId?: string;
    }
}



function setInitData(res: Response, initData: any): void {
    res.locals.initData = initData;
}

/**
 * Extracts init data from the Response object.
 * @param res - Response object.
 * @returns Init data stored in the Response object. Can return undefined in case,
 * the client is not authorized.
 */
export function getInitData(res: Response): any | undefined {
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
    console.log({ authData })
    switch (authType) {
        case 'tma':
            try {
                // console.log({token})
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
                next(error)
            }
        // ... other authorization methods.
        default:
            return next(new Error('Unauthorized'));
    }
}
