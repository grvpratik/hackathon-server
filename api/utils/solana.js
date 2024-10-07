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
exports.verifyTransaction = verifyTransaction;
const web3_js_1 = require("@solana/web3.js");
const constant_1 = require("../config/constant");
const connection = new web3_js_1.Connection(constant_1.RPC_URL);
function verifyTransaction(signature, senderAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const transaction = yield connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 1
        });
        if (!transaction) {
            return { success: false, message: "transation not found" };
        }
        const transferredAmount = ((_b = (_a = transaction.meta) === null || _a === void 0 ? void 0 : _a.postBalances[1]) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = transaction.meta) === null || _c === void 0 ? void 0 : _c.preBalances[1]) !== null && _d !== void 0 ? _d : 0);
        if (transferredAmount !== 100000000) {
            return { success: false, message: "Transaction signature/amount incorrect" };
        }
        const recipientAddress = (_e = transaction.transaction.message.getAccountKeys().get(1)) === null || _e === void 0 ? void 0 : _e.toString();
        if (recipientAddress !== constant_1.PARENT_WALLET_ADDRESS) {
            return { success: false, message: "tTransaction sent to wrong address" };
        }
        const actualSenderAddress = (_f = transaction.transaction.message.getAccountKeys().get(0)) === null || _f === void 0 ? void 0 : _f.toString();
        if (actualSenderAddress !== senderAddress) {
            return { success: false, message: "Transaction sent from wrong address" };
        }
        return { success: true, message: "completed" };
    });
}
