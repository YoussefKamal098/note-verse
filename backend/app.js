const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const config = require('./config/config');
const handleError = require('./middlewares/errorHandler.middleware');
const cspMiddleware = require('./middlewares/csp.middleware');
const timeoutMiddleware = require('./middlewares/timeout.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const startServer = require('./serverInitializer');
const routes = require('./routes/index');

const app = express();

// I will enable HTTPS (SSL/TLS) later
/**
 * For logging error, warning, and informational messages,
 * as well as API requests and responses, I will implement Winston logger in the future.
 */

// Timeout for all requests (e.g., 15 seconds)
app.use(timeoutMiddleware);
// Apply general helmet middleware for other security headers
app.use(helmet());
// Apply the custom CSP middleware for content security policy
app.use(cspMiddleware);
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
