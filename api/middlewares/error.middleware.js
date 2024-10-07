"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorMiddleware = void 0;
const error_1 = require("../config/error");
const defaultErrorMiddleware = (err, req, res, next) => {
    console.error("Default error handler caught:", err);
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof error_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.code || 'ERROR',
            message: err.message,
            errors: err.errors,
        });
    }
    // if (err instanceof ZodError) {
    //     return res.status(400).json({
    //         success: false,
    //         code: 'VALIDATION_ERROR',
    //         message: 'Invalid request data',
    //         errors: err.errors,
    //     });
    // }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            code: 'INVALID_ID',
            message: 'Invalid ID format',
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            code: 'INVALID_TOKEN',
            message: 'Invalid token',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired',
        });
    }
    // Default error
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
    });
};
exports.defaultErrorMiddleware = defaultErrorMiddleware;
