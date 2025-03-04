const Csrf = require('csrf');
const httpCodes = require('../constants/httpCodes');
const errorCodes = require('../constants/errorCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const csrfConfig = require('../config/csrfConfig');

class CsrfMiddleware {
    #tokens;
    #config;
    #secret;

    /**
     * Creates a new CsrfMiddleware instance
     * @param {CsrfConfig} config - Configuration object
     */
    constructor(config) {
        this.#config = config;
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
            res.cookie(this.#config.cookieName, token, this.#config.cookieOptions);

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
     * Express middleware for CSRF validation
     * @returns {import('express').RequestHandler}
     */
    validate() {
        return (req, res, next) => {
            // Skip CSRF validation for safe methods
            if (this.#config.ignoredMethods.includes(req.method)) {
                return next();
            }

            try {
                const token = this.#config.getTokenFromRequest(req);
                const cookieToken = req.cookies[this.#config.cookieName];

                // Validate token presence, format, validity and match
                if ((!token || !cookieToken) || !this.#tokens.verify(this.#secret, token) || token !== cookieToken) {
                    next(new AppError(
                        statusMessages.INVALID_CSRF_TOKEN,
                        httpCodes.FORBIDDEN.code,
                        errorCodes.CSRF_INVALID
                    ));
                }

                next();
            } catch (error) {
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
