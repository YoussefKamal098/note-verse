const timeoutHandler = require('express-timeout-handler');
const AppError = require("../errors/app.error");

const timeoutOptions = {
    timeout: 15000, // Timeout duration in milliseconds (e.g., 15 seconds)
    onTimeout: function(req, res, next) {
        next(new AppError('The request timed out. Please try again later.', 408));
    },
};

// Middleware function for request timeout
const timeoutMiddleware = (req, res, next) => {
    timeoutHandler.handler(timeoutOptions)(req, res, next);
};

module.exports = timeoutMiddleware;
