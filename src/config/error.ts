export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string,
        public errors?: any[]
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}