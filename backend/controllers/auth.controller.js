const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const jwtAuthService = require('../services/jwtAuth.service');

// I will implement csrf token generation for secure forms (login/register) later

/**
 * Controller for authentication-related endpoints.
 */
class AuthController {
    /**
     * @private
     * @type {import('../services/jwtAuth.service')}
     * @description The JWT authentication service instance.
     */
    #jwtAuthService;

    /**
     * Constructs a new AuthController.
     *
     * @param {import('../services/jwtAuth.service')} jwtAuthService - The JWT authentication service instance.
     */
    constructor(jwtAuthService) {
        this.#jwtAuthService = jwtAuthService;
    }

    /**
     * Sends the access and refresh tokens to the client.
     *
     * @private
     * @param {import('express').Response} res - The Express response object.
     * @param {string} accessToken - The JWT access token.
     * @param {string} refreshToken - The JWT refresh token.
     */
    #sendTokens(res, accessToken, refreshToken) {
        const cookieOptions = this.#jwtAuthService.config.getCookieOptions();
        res.cookie(this.#jwtAuthService.config.cookiesName, refreshToken, cookieOptions);
        res.json({accessToken});
    }

    /**
     * Registers a new user and automatically logs them in.
     *
     * Extracts session info from the request (IP and User-Agent) and passes it along to the JWT service.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>}
     * @throws {AppError} If user registration fails.
     */
    async register(req, res, next) {
        try {
            const {firstname, lastname, email, password} = req.body;
            // Extract session info from request
            const sessionInfo = {
                ip: req.ip,
                userAgent: req.get(httpHeaders.USER_AGENT)
            };
            const {accessToken, refreshToken} = await this.#jwtAuthService.register({
                firstname,
                lastname,
                email,
                password,
                sessionInfo
            });
            this.#sendTokens(res, accessToken, refreshToken);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logs in a user by verifying credentials and creating/reactivating a session.
     *
     * Extracts session info (IP and User-Agent) from the request and passes it to the JWT service.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>}
     * @throws {AppError} If credentials are missing or invalid.
     */
    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            if (!email || !password) {
                return next(new AppError(
                    statusMessages.CREDENTIALS_REQUIRED,
                    httpCodes.BAD_REQUEST.code,
                    httpCodes.BAD_REQUEST.name
                ));
            }
            const sessionInfo = {
                ip: req.ip,
                userAgent: req.get(httpHeaders.USER_AGENT)
            };

            const {accessToken, refreshToken} = await this.#jwtAuthService.login({
                email,
                password,
                sessionInfo
            });

            this.#sendTokens(res, accessToken, refreshToken);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logs out a user by marking the session as inactive.
     *
     * Retrieves the refresh token from cookies and calls the JWT service to log out.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>}
     * @throws {AppError} If the refresh token is not provided or is invalid.
     */
    async logout(req, res, next) {
        const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
        if (!refreshToken) {
            return next(new AppError(
                statusMessages.REFRESH_TOKEN_NOT_PROVIDED,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            ));
        }

        await this.#jwtAuthService.logout(refreshToken);
        const clearCookieOptions = this.#jwtAuthService.config.getClearCookieOptions();

        res.clearCookie(this.#jwtAuthService.config.cookiesName, clearCookieOptions);
        res.sendStatus(httpCodes.NO_CONTENT.code);
    }

    /**
     * Refreshes the access token using the refresh token from cookies.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {Function} next - The Express next middleware function.
     * @returns {Promise<void>}
     * @throws {AppError} If the refresh token is not provided or is invalid.
     */
    async refreshToken(req, res, next) {
        const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
        if (!refreshToken) {
            return next(new AppError(
                statusMessages.REFRESH_TOKEN_NOT_PROVIDED,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            ));
        }

        const {accessToken} = await this.#jwtAuthService.refreshToken(refreshToken);
        res.json({accessToken});
    }
}

module.exports = new AuthController(jwtAuthService);
