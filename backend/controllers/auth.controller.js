const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const config = require('../config/config');
const jwtAuthService = require('../services/jwtAuth.service');

// I will implement csrf token generation for secure forms (login/register) later

class AuthController {
    #jwtAuthService;

    constructor(jwtAuthService) {
        this.#jwtAuthService = jwtAuthService;
    }

    #sendTokens(res, accessToken, refreshToken) {
        const cookieOptions = this.#jwtAuthService.config.getCookieOptions(config.env);
        res.cookie(this.#jwtAuthService.config.cookiesName, refreshToken, cookieOptions);
        res.json({accessToken});
    }

    async register(req, res, next) {
        try {
            const {firstname, lastname, email, password} = req.body;
            const {accessToken, refreshToken} = await this.#jwtAuthService.register({
                firstname,
                lastname,
                email,
                password
            });

            this.#sendTokens(res, accessToken, refreshToken);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new AppError(
                statusMessages.CREDENTIALS_REQUIRED,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            ));
        }

        try {
            const {accessToken, refreshToken} = await this.#jwtAuthService.login({email, password});
            this.#sendTokens(res, accessToken, refreshToken);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
        if (!refreshToken) {
            return next(new AppError(
                statusMessages.REFRESH_TOKEN_NOT_PROVIDED,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            ));
        }

        try {
            await this.#jwtAuthService.logout(refreshToken);
            const clearCookieOptions = this.#jwtAuthService.config.getClearCookieOptions(config.env);

            res.clearCookie(this.#jwtAuthService.config.cookiesName, clearCookieOptions);
            res.sendStatus(httpCodes.NO_CONTENT.code);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
        if (!refreshToken) {
            return next(new AppError(
                statusMessages.REFRESH_TOKEN_NOT_PROVIDED,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            ));
        }

        try {
            const {accessToken} = await this.#jwtAuthService.refreshToken(refreshToken);
            res.json({accessToken});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController(jwtAuthService);
