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

    #getPayload(user={}) {
        return { id: user._id};
    }

    async register({firstname, lastname, email, password }) {
        const existingUser = await this.#userService.findByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists', 409);
        }

        await this.#userService.create({ email, password, firstname, lastname });
        // Automatically log the user in after registration
        return await this.login({ email, password });
    }

    async login({email, password}) {
        const user = await this.#userService.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 400);
        }

        if (!await this.#userService.passwordHasherService.verify(password, user.password)) {
            throw new AppError('Invalid email or password', 400);
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

        await this.#userService.updateRefreshToken(user._id, refreshToken);

        return { accessToken, refreshToken };
    }

    async verify(accessToken="") {
        try {
            const payload = await this.#jwtProviderService.verifyToken(accessToken, this.config.accessTokenSecret);
            const user = await this.#userService.findById(payload.id);
            if (user.refreshToken === null) throw new Error();
            return payload;
        } catch (error) {
            throw new AppError('Invalid or expired token', 401);
        }
    }

    async logout(refreshToken="") {
        const user = await this.#userService.findByRefreshToken(refreshToken);
        if (!user) {
            throw new AppError('Invalid or expired token', 401);
        }

        await this.#userService.updateRefreshToken(user._id, null);
    }

    async refreshToken(refreshToken="") {
        const user = await this.#userService.findByRefreshToken(refreshToken);
        if (!user){
            throw new AppError('Invalid or expired token', 401);
        }

        try {
            await this.#jwtProviderService.verifyToken(refreshToken, this.config.refreshTokenSecret);
        } catch (error) {
            await this.#userService.updateRefreshToken(user._id, null);
            throw new AppError('Invalid or expired token', 401);
        }

        const accessToken = await this.#jwtProviderService.generateToken(
            this.#getPayload(user),
            this.config.accessTokenSecret,
            this.config.accessTokenExpiry
        );

        return { accessToken };
    }
}

module.exports = new JwtAuthService(userService, new JwtProviderService(), config.authConfig);
