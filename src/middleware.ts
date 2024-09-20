import { NextFunction, Request, Response } from "express";


import { jwtVerify } from "jose";
import { secret } from "./routes/payer";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"] ?? "";

    try {

        async function verifyToken(token: string) {
            try {
                const { payload } = await jwtVerify(token, secret);
                return payload as { payerId: string; taskId: string };
            } catch (error) {
                return res.status(403).json({
                    message: "Invalid token"
                })
            }
        }
        const decoded = verifyToken(authHeader)
        console.log(decoded);
        // @ts-ignore
        if (decoded.payerId && decoded.taskId) {
            // @ts-ignore
            req.userId = decoded.userId;
            // @ts-ignore
            req.taskId = decoded.taskId;
            return next();
        } else {
            return res.status(403).json({
                message: "You are not logged in"
            })
        }
    } catch (e) {
        return res.status(403).json({
            message: "You are not logged in"
        })
    }
}

// export function workerMiddleware(req: Request, res: Response, next: NextFunction) {
//     const authHeader = req.headers["authorization"] ?? "";

//     console.log(authHeader);
//     try {
//         const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET);
//         // @ts-ignore
//         if (decoded.userId) {
//             // @ts-ignore
//             req.userId = decoded.userId;
//             return next();
//         } else {
//             return res.status(403).json({
//                 message: "You are not logged in"
//             })
//         }
//     } catch (e) {
//         return res.status(403).json({
//             message: "You are not logged in"
//         })
//     }
// }