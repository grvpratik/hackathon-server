"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createPaymentToken = createPaymentToken;
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
const jose_1 = require("jose");
const jose = __importStar(require("jose"));
const constant_1 = require("../config/constant");
const secret = new TextEncoder().encode(constant_1.SECRET_KEY);
function createPaymentToken(payerId, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield new jose.SignJWT({ payerId, taskId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')
            .sign(secret);
    });
}
function createSessionToken(id, tg_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const telegramId = tg_id.toString();
        const jwt = yield new jose.SignJWT({ id, telegramId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30day')
            .sign(secret);
        return jwt;
    });
}
function verifySessionToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { payload } = yield (0, jose_1.jwtVerify)(token, secret);
            return payload; // Return the decoded payload if verification is successful
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return null; // or throw an error
        }
    });
}
