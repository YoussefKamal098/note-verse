const CsrfMiddleware = require('../middlewares/csrf.middleware');

const csrfInstance = CsrfMiddleware.create();

/**
 * Middleware that generates a CSRF token using the singleton instance and
 * attaches it to `res.locals` for later use.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
const csrfTokenMiddleware = (req, res, next) => {
    try {
        res.locals.csrfToken = csrfInstance.generateToken(req, res);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = csrfTokenMiddleware;
