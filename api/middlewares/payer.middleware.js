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
const constant_1 = require("../config/constant");
const secret = new TextEncoder().encode(constant_1.SECRET_KEY);
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
        // console.log({authHeader})
        // Early return if authorization header is missing
        if (!authHeader) {
            return res.status(403).json({ message: "You are not logged in" });
        }
        try {
            // Function to verify JWT token
            const { payload } = yield (0, jose_1.jwtVerify)(authHeader, secret);
            if (!payload || !payload.payerId || !payload.taskId || !payload.amount) {
                return res.status(403).json({ message: "Invalid token payload" });
            }
            console.log(payload.payerId);
            // Assign values to the extended req properties
            req.payerId = payload.payerId;
            req.taskId = payload.taskId;
            req.amount = payload.amount;
            next(); // Proceed to the next middleware or route handler
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    });
}
