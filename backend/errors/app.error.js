/**
 * Custom application error class for handling HTTP errors.
 *
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
    /**
     * Creates an instance of AppError.
     *
     * @param {string} [message='Internal Server Error'] - The error message.
     * @param {number} [httpCode=500] - The HTTP status code associated with the error.
     * @param {string} [name='Error'] - The name of the error.
     */
    constructor(message = 'Internal Server Error', httpCode = 500, name = "Error") {
        super(message || 'Internal Server Error');
        this.httpCode = httpCode || 500;
        this.name = name || 'Error';

        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
