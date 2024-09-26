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
exports.defaultErrorMiddleware = void 0;
exports.authMiddleware = authMiddleware;
exports.getInitData = getInitData;
exports.userMiddleware = userMiddleware;
const jose_1 = require("jose");
const payer_1 = require("./routes/payer");
const init_data_node_1 = require("@telegram-apps/init-data-node");
const token = process.env.TELEGRAM_BOT_TOKEN;
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
function setInitData(res, initData) {
    res.locals.initData = initData;
}
/**
 * Extracts init data from the Response object.
 * @param res - Response object.
 * @returns Init data stored in the Response object. Can return undefined in case,
 * the client is not authorized.
 */
function getInitData(res) {
    return res.locals.initData;
}
/**
 * Middleware which authorizes the external client.
 * @param req - Request object.
 * @param res - Response object.
 * @param next - function to call the next middleware.
 */
function userMiddleware(req, res, next) {
    // We expect passing init data in the Authorization header in the following format:
    // <auth-type> <auth-data>
    // <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data.
    const [authType, authData = ''] = (req.header('authorization') || '').split(' ');
    console.log({ authData });
    switch (authType) {
        case 'tma':
            try {
                console.log({ token });
                // Validate init data.
                (0, init_data_node_1.validate)(authData, token, {
                    // We consider init data sign valid for 1 hour from their creation moment.
                    expiresIn: 3600,
                });
                // Parse init data. We will surely need it in the future.
                setInitData(res, (0, init_data_node_1.parse)(authData));
                const initData = (0, init_data_node_1.parse)(authData);
                const currentTime = Math.floor(Date.now() / 1000);
                const authDate = initData.authDate;
                // console.log({ x ,currentTime})
                console.log(`Current time: ${currentTime}, Auth date: ${authDate}, `);
                return next();
            }
            catch (e) {
                console.log("init data");
                console.log(e);
                return res.status(500).json({ message: "Init data expired or invalid" });
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
const defaultErrorMiddleware = (err, req, res, next) => {
    console.error("Default error handler caught:", err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({
        error: err.message || 'Internal Server Error',
    });
};
exports.defaultErrorMiddleware = defaultErrorMiddleware;
