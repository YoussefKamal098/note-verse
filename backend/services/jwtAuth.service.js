const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const userService = require('../services/user.service');
const JwtProviderService = require('../services/jwtProvider.service');
const config = require('../config/config');

// Later on, I'll use Gmail to allow users to change their password and email address and
// integrate Cross-Browser and Cross-Device Authentication (login).

class JwtAuthService {
    #userService;
    #jwtProviderService;

    constructor(userService, jwtProviderService, config) {
        this.#userService = userService;
        this.#jwtProviderService = jwtProviderService;
        this.config = config; // Authentication-related configurations
    }

    #getPayload(user = {}) {
        return {id: user.id};
    }

    async register({firstname, lastname, email, password}) {
        const existingUser = await this.#userService.findByEmail(email);
        if (existingUser) {
            throw new AppError(
                statusMessages.USER_ALREADY_EXISTS,
                httpCodes.CONFLICT.code,
                httpCodes.CONFLICT.name
            );
        }

        await this.#userService.create({email, password, firstname, lastname});
        // Automatically log the user in after registration
        return await this.login({email, password});
    }

    async login({email, password}) {
        const user = await this.#userService.findByEmail(email);
        if (!user) {
            throw new AppError(
                statusMessages.INVALID_CREDENTIALS,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        if (!await this.#userService.passwordHasherService.verify(password, user.password)) {
            throw new AppError(
                statusMessages.INVALID_CREDENTIALS,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        const accessToken = await this.#jwtProviderService.generateToken(
            this.#getPayload(user),
            this.config.accessTokenSecret,
            this.config.accessTokenExpiry
        );

        const refreshToken = await this.#jwtProviderService.generateToken(
            this.#getPayload(user),
            this.config.refreshTokenSecret,
            this.config.refreshTokenExpiry
        );

        await this.#userService.updateRefreshToken(user.id, refreshToken);

        return {accessToken, refreshToken};
    }

    async verify(accessToken = "") {
        try {
            const payload = await this.#jwtProviderService.verifyToken(accessToken, this.config.accessTokenSecret);
            const user = await this.#userService.findById(payload.id);
            if (user.refreshToken === null) throw new Error();
            return payload;
        } catch (error) {
            throw new AppError(
                statusMessages.INVALID_OR_EXPIRED_TOKEN,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }
    }

    async logout(refreshToken = "") {
        const user = await this.#userService.findByRefreshToken(refreshToken);
        if (!user) {
            throw new AppError(
                statusMessages.INVALID_REFRESH_TOKEN,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }

        await this.#userService.updateRefreshToken(user.id, null);
    }

    async refreshToken(refreshToken = "") {
        const user = await this.#userService.findByRefreshToken(refreshToken);
        if (!user) {
            throw new AppError(
                statusMessages.INVALID_REFRESH_TOKEN,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }

        try {
            await this.#jwtProviderService.verifyToken(refreshToken, this.config.refreshTokenSecret);
        } catch (error) {
            await this.#userService.updateRefreshToken(user.id, null);
            throw new AppError(
                statusMessages.INVALID_REFRESH_TOKEN,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }

        const accessToken = await this.#jwtProviderService.generateToken(
            this.#getPayload(user),
            this.config.accessTokenSecret,
            this.config.accessTokenExpiry
        );

        return {accessToken};
    }
}

module.exports = new JwtAuthService(userService, new JwtProviderService(), config.authConfig);
