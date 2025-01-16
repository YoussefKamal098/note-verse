const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

// Middleware for handling non-existent routes
const notFoundMiddleware = (req, res, next) => {
    next(new AppError(
        statusMessages.RESOURCE_NOT_FOUND,
        httpCodes.NOT_FOUND.code,
        httpCodes.NOT_FOUND.name
    ));
};

module.exports = notFoundMiddleware;
