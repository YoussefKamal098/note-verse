const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
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