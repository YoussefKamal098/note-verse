const {parseTime} = require("shared-utils/date.utils");
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');
const JwtProviderService = require('../services/jwtProvider.service');
const authConfig = require('../config/authConfig');

/**
 * @class JwtAuthService
 * @classdesc Provides JWT authentication services including user registration, login, token issuance, token verification, token refresh, and logout.
 *
 * This service coordinates between the UserService, SessionService, and JwtProviderService to:
 * - Verify user credentials.
 * - Manage sessions by creating, reactivating, and inactivating sessions.
 * - Generate JWT access and refresh tokens with payloads that include both the user ID and session ID.
 * - Validate and refresh tokens, handling expiration by marking sessions as inactive when needed.
 *
 * The service supports multiple concurrent sessions from different devices and locations, ensuring enhanced security and control over active sessions.
 */
class JwtAuthService {
    /**
     * @private
     * @type {import('../services/user.service')}
     * @description The UserService instance used for user operations.
     */
    #userService;
    /**
     * @private
     * @type {import('../services/session.service')}
     * @description The SessionService instance used to manage session-related operations.
     */
    #sessionService;
    /**
     * @private
     * @type {JwtProviderService}
     * @description The JWT provider service used to generate and verify tokens.
     */
    #jwtProviderService;


    /**
     * Constructs a new JwtAuthService.
     *
     * @param {import('../services/user.service')} userService - An instance of UserService.
     * @param {import('../services/session.service')} sessionService - An instance of SessionService.
     * @param {JwtProviderService} jwtProviderService - An instance of JwtProviderService.
     * @param {AuthConfig} config - The authentication configuration object
     */
    constructor(userService, sessionService, jwtProviderService, config) {
        this.#userService = userService;
        this.#sessionService = sessionService;
        this.#jwtProviderService = jwtProviderService;
        this.config = config;
    }

    /**
     * Constructs the JWT payload with the user and session identifiers.
     *
     * @private
     * @param {string} userId - The user's ID.
     * @param {string} sessionId - The session ID.
     * @returns {JwtPayload} The JWT payload object.
     */
    #getPayload(userId, sessionId) {
        return {userId, sessionId};
    }

    /**
     * Helper method to verify a token while detecting errors.
     *
     * It uses detectTokenError to determine if the token is expired or invalid.
     * If the token is expired, it decodes the token, marks the associated session as inactive,
     * and throws an error with the provided expired error message.
     * If the token is invalid for another reason, it throws an error with the provided invalid message.
     * Otherwise, it verifies the token normally and returns the decoded payload.
     *
     * @private
     * @param {string} token - The JWT token to verify.
     * @param {string} secret - The secret key used for verification.
     * @param {string} expiredErrorMsg - The error message for an expired token.
     * @param {string} invalidErrorMsg - The error message for an invalid token.
     * @returns {Promise<object>} The decoded token payload.
     * @throws {AppError} If the token is expired or invalid.
     */
    async #verifyOrHandleTokenError(token, secret, expiredErrorMsg, invalidErrorMsg) {
        const {expired, error} = await this.#jwtProviderService.detectTokenError(token, secret);
        if (expired) {
            const payload = await this.#jwtProviderService.decodeExpiredToken(token, secret);
            if (payload && payload.sessionId) {
                await this.#sessionService.inactivateSession(payload.sessionId);
            }
            throw new AppError(expiredErrorMsg, httpCodes.UNAUTHORIZED.code, httpCodes.UNAUTHORIZED.name);
        }
        if (error) {
            throw new AppError(invalidErrorMsg, httpCodes.UNAUTHORIZED.code, httpCodes.UNAUTHORIZED.name);
        }
        return await this.#jwtProviderService.verifyToken(token, secret);
    }

    /**
     * Verifies user credentials.
     *
     * @private
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {Promise<object>} The verified user object.
     * @throws {AppError} If the user is not found or if the password is invalid.
     */
    async #verifyUserCredentials(email, password) {
        const user = await this.#userService.findByEmail(email);
        if (!user) {
            throw new AppError(
                statusMessages.INVALID_CREDENTIALS,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }
        const passwordValid = await this.#userService.passwordHasherService.verify(password, user.password);
        if (!passwordValid) {
            throw new AppError(
                statusMessages.INVALID_CREDENTIALS,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }
        return user;
    }

    /**
     * Handles session creation or reactivation for a given user.
     *
     * @private
     * @param {string} userId - The user's ID.
     * @param {SessionInfo} sessionInfo - Session info containing ip and userAgent.
     * @returns {Promise<object>} The session object.
     * @throws {AppError} If an active session already exists for this device and location.
     */
    async #handleSession(userId, sessionInfo) {
        let session = await this.#sessionService.findActiveSessionByUserIpAgent({
            userId: userId,
            ip: sessionInfo.ip,
            userAgent: sessionInfo.userAgent,
        });

        if (session) {
            // Active session exists: user is already logged in on this device/location.
            throw new AppError(
                statusMessages.USER_ALREADY_LOGGED_IN_SAME_DEVICE,
                httpCodes.CONFLICT.code,
                httpCodes.CONFLICT.name
            );
        }
        // No existing session: create a new one.
        const expiredAt = parseTime(this.config.refreshTokenExpiry);
        session = await this.#sessionService.createSession({
            userId: userId,
            ip: sessionInfo.ip,
            userAgent: sessionInfo.userAgent,
            expiredAt
        });

        return session;
    }

    /**
     * Registers a new user and automatically logs them in.
     *
     * @param {object} data - Registration data.
     * @param {string} [data.firstname] - The user's first name (optional).
     * @param {string} [data.lastname] - The user's last name (optional).
     * @param {string} data.email - The user's email.
     * @param {string} data.password - The user's password.
     * @param {SessionInfo} data.sessionInfo - Session info containing ip and userAgent.
     * @returns {Promise<{ accessToken: string, refreshToken: string }>} An object containing accessToken and refreshToken.
     * @throws {AppError} If a user with the given email already exists.
     */
    async register({firstname, lastname, email, password, sessionInfo}) {
        const existingUser = await this.#userService.findByEmail(email);
        if (existingUser) {
            throw new AppError(
                statusMessages.USER_ALREADY_EXISTS,
                httpCodes.CONFLICT.code,
                httpCodes.CONFLICT.name
            );
        }
        await this.#userService.create({email, password, firstname, lastname});
        // Automatically log the user in after registration.
        return this.login({email, password, sessionInfo});
    }

    /**
     * Logs in a user by verifying credentials and handling session creation/reactivation.
     *
     * This method verifies the user's credentials and then checks if a session exists for the same IP and device.
     * - If an active session exists, it throws a conflict error.
     * - If an inactive session exists, it reactivates the session.
     * - Otherwise, it creates a new session.
     *
     * Finally, it generates JWT tokens with a payload that includes both the user ID and the session ID.
     *
     * @param {object} data - Login data.
     * @param {string} data.email - The user's email.
     * @param {string} data.password - The user's password.
     * @param {SessionInfo} data.sessionInfo - Session info containing ip and userAgent.
     * @returns {Promise<{ accessToken: string, refreshToken: string }>} An object containing accessToken and refreshToken.
     * @throws {AppError} If credentials are invalid or if the user is already logged in from that device/location.
     */
    async login({email, password, sessionInfo}) {
        // Verify user credentials.
        const user = await this.#verifyUserCredentials(email, password);

        // Handle session creation or reactivation.
        const session = await this.#handleSession(user.id, sessionInfo);

        // Build JWT payload and generate tokens.
        const payload = this.#getPayload(user.id, session.id);
        const accessToken = await this.#jwtProviderService.generateToken(
            payload,
            this.config.accessTokenSecret,
            this.config.accessTokenExpiry
        );
        const refreshToken = await this.#jwtProviderService.generateToken(
            payload,
            this.config.refreshTokenSecret,
            this.config.refreshTokenExpiry
        );

        return {accessToken, refreshToken};
    }

    /**
     * Verifies an access token and ensures the associated session is active.
     *
     * If token verification fails (e.g., token is expired), this method decodes the token,
     * marks the associated session as inactive, and throws an error.
     *
     * @param {string} accessToken - The JWT access token.
     * @returns {Promise<JwtPayload>} The decoded JWT payload.
     * @throws {AppError} If the token is invalid/expired or if the session is inactive.
     */
    async verify(accessToken) {
        const payload = await this.#verifyOrHandleTokenError(
            accessToken,
            this.config.accessTokenSecret,
            statusMessages.ACCESS_TOKEN_EXPIRED,
            statusMessages.ACCESS_TOKEN_EXPIRED
        );

        if (await this.#sessionService.isSessionExpired(payload.sessionId)) {
            throw new AppError(
                statusMessages.ACCESS_TOKEN_EXPIRED,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }

        await this.#sessionService.updateLastAccess(payload.sessionId);
        return payload;
    }

    /**
     * Logs out a session by marking it as inactive.
     *
     * If the refresh token is expired, this method decodes the token, marks the associated session as inactive,
     * and throws an error indicating that the token has expired.
     *
     * @param {string} refreshToken - The JWT refresh token.
     * @returns {Promise<void>}
     * @throws {AppError} If the refresh token is invalid, or if the session is not found or already logged out.
     */
    async logout(refreshToken) {
        const payload = await this.#verifyOrHandleTokenError(
            refreshToken,
            this.config.refreshTokenSecret,
            statusMessages.REFRESH_TOKEN_EXPIRED,
            statusMessages.INVALID_REFRESH_TOKEN
        );

        // If the token is valid, get payload and mark session inactive.
        await this.#sessionService.inactivateSession(payload.sessionId);
    }

    /**
     * Refreshes the access token using a valid refresh token.
     *
     * If the refresh token is expired, this method decodes it, marks the associated session as inactive,
     * and throws an error.
     *
     * @param {string} refreshToken - The JWT refresh token.
     * @returns {Promise<{ accessToken: string }>} An object containing a new access token.
     * @throws {AppError} If the refresh token is invalid or if the session is inactive.
     */
    async refreshToken(refreshToken) {
        const payload = await this.#verifyOrHandleTokenError(
            refreshToken,
            this.config.refreshTokenSecret,
            statusMessages.REFRESH_TOKEN_EXPIRED,
            statusMessages.INVALID_REFRESH_TOKEN
        );

        if (await this.#sessionService.isSessionExpired(payload.sessionId)) {
            throw new AppError(
                statusMessages.REFRESH_TOKEN_EXPIRED,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }

        const newPayload = this.#getPayload(payload.userId, payload.sessionId);
        const newAccessToken = await this.#jwtProviderService.generateToken(
            newPayload,
            this.config.accessTokenSecret,
            this.config.accessTokenExpiry
        );

        await this.#sessionService.updateLastAccess(payload.sessionId);
        return {accessToken: newAccessToken};
    }
}

module.exports = new JwtAuthService(userService, sessionService, new JwtProviderService(), authConfig);
