"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitData = getInitData;
exports.userMiddleware = userMiddleware;
const init_data_node_1 = require("@telegram-apps/init-data-node");
const console_1 = require("console");
const token = process.env.TELEGRAM_BOT_USER_TOKEN;
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
    switch (authType) {
        case 'tma':
            try {
                console.log({ token, authData });
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
                next(console_1.error);
            }
        // ... other authorization methods.
        default:
            return next(new Error('Unauthorized'));
    }
}
