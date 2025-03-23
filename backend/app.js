const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const corsOptions = require('./config/corsOptions');
const config = require('./config/config');
const asyncRequestHandler = require('./utils/asyncHandler');
const handleError = require('./middlewares/errorHandler.middleware');
const securityHeadersMiddleware = require('./middlewares/securityHeaders.middleware');
const {createTimeoutMiddleware} = require('./middlewares/timeout.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const startServer = require('./serverInitializer');
const loggerService = require('./services/logger.service');
const routes = require('./routes/index');

const app = express();

// I will enable HTTPS (SSL/TLS) later

// Enable response compression
app.use(compression({
    level: 6, // Compression level (0-9). 6 is a good balance between speed and compression.
    threshold: 1024, // Compress responses larger than 1KB
}));

// Use Morgan with the loggerService's stream method
app.use(morgan('combined', {stream: loggerService.stream}));
// Timeout for all requests (e.g., 15 seconds)
app.use(createTimeoutMiddleware());
// Apply the custom asynchronous security middleware that sets the Content Security Policy (CSP)
// along with other security headers. This middleware ensures that all asynchronous tasks complete
// (such as nonce generation and helmet configuration) before proceeding to the next handler.
app.use(asyncRequestHandler(securityHeadersMiddleware));
// Enable CORS with specified options
app.use(cors(corsOptions));
// Middleware to parse cookies
app.use(cookieParser());
// Middleware to parse JSON bodies with size limit (e.g., 1MB)
app.use(express.json({limit: '1mb'}));
// Middleware to parse URL-encoded forms with size limit (e.g., 1MB)
app.use(express.urlencoded({extended: true, limit: '1mb'}));

// All routes
app.use('/api/v1', routes);

// Catch-all for non-existent routes
app.use(notFoundMiddleware);
// Middleware to handle application-wide errors and send error responses
app.use(handleError);

startServer({server: app, port: config.port})
    .then(() => console.log('Server started successfully'));
