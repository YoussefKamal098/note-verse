const config = require('./config');
const AppError = require('../errors/app.error');

const corsOptions = {
    origin: (origin, callback) => {
        if (config.allowedOrigins.includes(origin) || !origin) {
            callback(null, true);  // Allow requests from allowed origins or non-browser requests
        } else {
            callback(new AppError('CORS not allowed', 403), false);  // Deny request with AppError
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
    credentials: true,  // Allow credentials (cookies, headers, etc.)
    preflightContinue: false,  // Handle preflight requests automatically
    optionsSuccessStatus: 204  // Return a successful status code for OPTIONS requests
};

module.exports = corsOptions;
