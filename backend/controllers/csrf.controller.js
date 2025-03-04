const AppError = require("../errors/app.error");
const statusMessages = require("../constants/statusMessages");
const httpCodes = require("../constants/httpCodes");
const errorCodes = require("../constants/errorCodes");

/**
 * Controller for handling CSRF token requests.
 */
class CsrfController {
    /**
     * Sends the CSRF token attached by the csrfTokenMiddleware.
     *
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     * @param {import('express').NextFunction} next - Express next middleware function.
     */
    getToken(req, res, next) {
        // The token was generated and set by the middleware.
        const token = res.locals.csrfToken;
        if (!token) {
            throw new AppError(
                statusMessages.CSRF_TOKEN_GENERATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                errorCodes.CSRF_GENERATION_FAILED
            );
        }

        res.json({csrfToken: token});
    }
}

module.exports = new CsrfController();
