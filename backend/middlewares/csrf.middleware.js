const Csrf = require('csrf');
const httpCodes = require('../constants/httpCodes');
const errorCodes = require('../constants/errorCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const csrfConfig = require('../config/csrfConfig');
const {deepClone, deepFreeze} = require("shared-utils/obj.utils");

class CsrfMiddleware {
    #tokens;
    #config;
    #secret;

    /**
     * Creates a new CsrfMiddleware instance
     * @param {CsrfConfig} config - Configuration object
     */
    constructor(config) {
        this.#config = deepFreeze(deepClone(config));
        this.#tokens = new Csrf({saltLength: this.#config.saltLength});
        this.#secret = config.secret;

        // Validate secret format
        if (!this.#secret || typeof this.#secret !== 'string') {
            throw new Error('Invalid CSRF secret configuration');
        }
    }

    /**
     * Factory method to create CSRF middleware instance
     * @param {Partial<CsrfConfig>} [customConfig] - Optional custom configuration
     * @returns {CsrfMiddleware}
     */
    static create(customConfig = {}) {
        return new CsrfMiddleware({
            ...csrfConfig,
            ...customConfig
        });
    }

    /**
     * Generates CSRF token and sets cookie
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @returns {string} Generated CSRF token
     * @throws {AppError} If token generation fails
     */
    generateToken(req, res) {
        try {
            const token = this.#tokens.create(this.#secret);

            // Set CSRF token cookie
            res.cookie(this.#config.cookieName, token, this.#config.getCookieOptions());

            return token;
        } catch (error) {
            console.error('CSRF Token Generation Error:', error);
            throw new AppError(
                statusMessages.CSRF_TOKEN_GENERATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                errorCodes.CSRF_GENERATION_FAILED
            );
        }
    }

    /**
     * Returns an Express middleware function for CSRF validation.
     *
     * This middleware extracts the CSRF token from the request using the source specified in the options
     * (or the default source from the configuration).
     * It then compares the extracted token with the token
     * stored in the cookie using the token verification function.
     * If the tokens are missing, invalid, or do not match,
     * the middleware clears the CSRF cookie and passes an error to the next middleware.
     *
     * @param {Object} [options={}] - Options for token extraction.
     * @param {string} [options.source='header'] - The source to extract the CSRF token ('body', 'header', 'query').
     * @returns {import('express').RequestHandler} An Express middleware function for CSRF validation.
     */
    validate(options = {}) {
        return (req, res, next) => {
            // Skip CSRF validation for safe methods
            if (this.#config.ignoredMethods.includes(req.method)) {
                return next();
            }

            try {
                // Determine the token source: use provided source or fallback to defaultSource.
                const tokenSource = options.source || this.#config.defaultSource;
                // Use the configuration's getTokenFromRequest method to extract the token.
                const token = this.#config.getTokenFromRequest(req, tokenSource);
                const cookieToken = req.cookies[this.#config.cookieName];

                // Validate token presence and matching.
                if ((!token || !cookieToken) || !this.#tokens.verify(this.#secret, token) || token !== cookieToken) {
                    res.clearCookie(this.#config.cookieName, this.#config.clearCookieOptions);
                    return next(new AppError(
                        statusMessages.INVALID_CSRF_TOKEN,
                        httpCodes.FORBIDDEN.code,
                        errorCodes.CSRF_INVALID
                    ));
                }

                next();
            } catch (error) {
                res.clearCookie(this.#config.cookiesName, this.#config.clearCookieOptions);
                throw new AppError(
                    statusMessages.SERVER_ERROR,
                    httpCodes.INTERNAL_SERVER_ERROR.code,
                    httpCodes.INTERNAL_SERVER_ERROR.name
                );
            }
        };
    }
}

module.exports = CsrfMiddleware;
