"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jose_1 = require("jose");
const payer_1 = require("./routes/payer");
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
        console.log({ authHeader });
        // Early return if authorization header is missing
        if (!authHeader) {
            return res.status(403).json({ message: "You are not logged in" });
        }
        try {
            // Function to verify JWT token
            const { payload } = yield (0, jose_1.jwtVerify)(authHeader, payer_1.secret);
            if (!payload || !payload.payerId || !payload.taskId) {
                return res.status(403).json({ message: "Invalid token payload" });
            }
            console.log(payload.payerId);
            // Assign values to the extended req properties
            req.payerId = payload.payerId;
            req.taskId = payload.taskId;
            next(); // Proceed to the next middleware or route handler
        }
        catch (error) {
            return res.status(403).json({ message: "Invalid token" });
        }
    });
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
