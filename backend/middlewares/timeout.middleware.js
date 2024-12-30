const timeoutHandler = require('express-timeout-handler');

const timeoutOptions = {
    timeout: 15000, // Timeout duration in milliseconds (e.g., 15 seconds)
    onTimeout: function(req, res) {
        // If a timeout occurs, handle it here
        return res.status(408).json({ error: 'Request Timeout' });
    },
};

// Middleware function for request timeout
const timeoutMiddleware = (req, res, next) => {
    timeoutHandler.handler(timeoutOptions)(req, res, next);
};

module.exports = timeoutMiddleware;
