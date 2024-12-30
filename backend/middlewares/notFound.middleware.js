const AppError = require('../errors/app.error');

// Middleware for handling non-existent routes
const notFoundMiddleware = (req, res, next) => {
    next(new AppError('Not Found', 404));
};

module.exports = notFoundMiddleware;
