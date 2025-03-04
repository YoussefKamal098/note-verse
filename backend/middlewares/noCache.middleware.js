const httpHeaders = require("../constants/httpHeaders");
/**
 * Middleware to prevent caching of responses.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const noCacheMiddleware = (req, res, next) => {
    // Set cache-control headers so that the response is never cached.
    res.setHeader(httpHeaders.CACHE_CONTROL, 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader(httpHeaders.PRAGMA, 'no-cache');
    res.setHeader(httpHeaders.EXPIRES, '0');
    next();
};

module.exports = noCacheMiddleware;
