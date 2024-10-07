"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, code, errors) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.errors = errors;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
