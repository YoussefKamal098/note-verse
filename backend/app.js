require('module-alias/register');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const corsOptions = require('@/config/corsOptions');
const config = require('./config/config');
const asyncRequestHandler = require('./utils/asyncHandler');
const handleError = require('./middlewares/errorHandler.middleware');
const securityHeadersMiddleware = require('./middlewares/securityHeaders.middleware');
const {createTimeoutMiddleware} = require('./middlewares/timeout.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const startServer = require('./serverInitializer');
const {scopePerRequest} = require('awilix-express');
const container = require('./container');
const loggerService = require('./services/logger.service');
const routes = require('./routes/index');
const shutdownHandler = require('./utils/shutdownHandler');

const app = express();

// FUTURE: Enable HTTPS (SSL/TLS) support for production
// FUTURE: Switch to HTTP/2 with fallback to HTTP/1.1 for Socket.IO compatibility
// HTTP/2 enables multiplexing, header compression, and faster load times.
// Learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview#http2_vs_http11

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
// Attach a scoped DI container to each request for per-request dependency resolution
app.use(scopePerRequest(container));

// All routes
app.use('/api/v1', routes);

// Catch-all for non-existent routes
app.use(notFoundMiddleware);
// Middleware to handle application-wide errors and send error responses
app.use(handleError);

process.on('SIGINT', async () => {
    await shutdownHandler();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await shutdownHandler();
    process.exit(0);
});

process.on('SIGQUIT', async () => {
    await shutdownHandler();
    process.exit(0);
});

startServer({server: app, port: config.port})
    .then(() => console.log('Server started successfully'));
