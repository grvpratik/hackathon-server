import { ErrorRequestHandler } from "express";

/**
 * Middleware which displays the user init data.
 * @param err - handled error.
 * @param _req
 * @param res - Response object.
 */
export const defaultErrorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    console.error("Default error handler caught:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: err.message || 'Internal Server Error',
    });
};