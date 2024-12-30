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
        const expires = new Date(new Date().getTime() + this.#jwtAuthService.config.cookiesMaxAge);

        res.cookie(this.#jwtAuthService.config.cookiesName, refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: config.env === 'production',
            maxAge:  this.#jwtAuthService.config.cookiesMaxAge * 1000,  // in milliseconds
            expires
        });

        res.json({ accessToken });
    }

    async register(req, res, next) {
        try {
            const { firstname, lastname, email, password } = req.body;
            const { accessToken, refreshToken } = await this.#jwtAuthService.register({ firstname, lastname, email, password });

            this.#sendTokens(res, accessToken, refreshToken);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError("Email and password are required", 400));
        }

        try {
            const { accessToken, refreshToken } = await this.#jwtAuthService.login({ email, password });
            this.#sendTokens(res, accessToken, refreshToken);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
        if (!refreshToken) {
            return next(new AppError('Refresh Token is required', 401));
        }

        try {
            await this.#jwtAuthService.logout(refreshToken);

            res.clearCookie(this.#jwtAuthService.config.cookiesName,{
                sameSite: 'strict',
                secure: config.env === 'production'
            });
            res.sendStatus(204); // No Content
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        const refreshToken = req.cookies[this.#jwtAuthService.config.cookiesName];
        if (!refreshToken) {
            return next(new AppError('Refresh Token is required', 401));
        }

        try {
            const { accessToken } = await this.#jwtAuthService.refreshToken(refreshToken);
            res.json({ accessToken });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController(jwtAuthService);
