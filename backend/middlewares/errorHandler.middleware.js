const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

/**
 * Express error handling middleware.
 *
 * If the error is an instance of AppError, it sends a JSON response with the error message,
 * HTTP status code, and an optional custom error code.
 * Otherwise, it logs the error and responds with a generic internal server error.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.httpCode).json({
            status: 'error',
            message: err.message,
            code: err.name
        });
    } else {
        console.error('Internal Server Error:', err);
        res.status(httpCodes.INTERNAL_SERVER_ERROR.code).json({
            status: 'error',
            message: statusMessages.SERVER_ERROR,
        });
    }
};

module.exports = errorHandlerMiddleware;
