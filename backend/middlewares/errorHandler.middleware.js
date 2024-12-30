const AppError = require('../errors/app.error');

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    } else {
        console.error('Internal Server Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! Please try again later.',
        });
    }
};

module.exports = errorHandlerMiddleware;