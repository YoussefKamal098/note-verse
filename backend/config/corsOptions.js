const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const httpHeaders = require('../constants/httpHeaders');
const config = require('./config');
const AppError = require('../errors/app.error');
const {deepFreeze} = require("shared-utils/obj.utils");

const corsOptions = {
    origin: (origin, callback) => {
        if (config.allowedOrigins.includes(origin) || !origin) {
            callback(null, true);  // Allow requests from allowed origins or non-browser requests
        } else {
            // Deny the request for disallowed origins
            const error = new AppError(
                statusMessages.CORS_NOT_ALLOWED,
                httpCodes.FORBIDDEN.code,
                httpCodes.FORBIDDEN.name
            );
            callback(error, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
    allowedHeaders: [httpHeaders.CONTENT_TYPE, httpHeaders.AUTHORIZATION, httpHeaders.IF_NONE_MATCH, httpHeaders.X_CSRF_TOKEN],  // Allowed headers
    exposedHeaders: [httpHeaders.ETAG], // Expose the ETag header to the client
    credentials: true,  // Allow credentials (cookies, headers, etc.)
    preflightContinue: false,  // Handle preflight requests automatically
    optionsSuccessStatus: httpCodes.NO_CONTENT.code // Return a successful status code for OPTIONS requests
};

module.exports = deepFreeze(corsOptions);
