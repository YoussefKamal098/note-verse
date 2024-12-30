class AppError extends Error {
    constructor(message, statusCode, name="AppError") {
        super(message || 'Internal Server Error');
        this.statusCode = statusCode || 500;
        this.name = name || 'AppError';

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

module.exports = AppError;
