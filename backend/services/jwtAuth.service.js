const {parseTime} = require("shared-utils/date.utils");
const {generateSecureOTP} = require('../utils/otp.utils');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const errorCodes = require('../constants/errorCodes');
const AppError = require('../errors/app.error');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');
const JwtProviderService = require('../services/jwtProvider.service');
const authConfig = require('../config/authConfig');
const {deepClone, deepFreeze} = require("shared-utils/obj.utils");

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
     * @private
     * @type {AuthConfig}
     * @description The authentication configuration object
     */
    #config;

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
        this.#config = deepFreeze(deepClone(config));
    }

    /**
     * Immutable authentication configuration
     * @type {AuthConfig}
     * @readonly
     */
    get config() {
        return this.#config;
    }

    /**
     * Generates a JWT token using the provided payload, secret, and expiration.
     *
     * @public
     * @param {object} payload - The payload for the JWT.
     * @param {string} secret - The secret key to sign the token.
     * @param {string|number} expiresIn - The expiration time for the token ("1h" hours, "1d" days, "1m" minutes etc.).
     * @returns {Promise<string>} The generated JWT token.
     */
    async generateToken(payload, secret, expiresIn) {
        return await this.#jwtProviderService.generateToken(payload, secret, expiresIn);
    }

    /**
     * Verifies a JWT token using the provided secret.
     *
     * @public
     * @param {string} token - The JWT token to verify.
     * @param {string} secret - The secret key used to verify the token.
     * @returns {Promise<object>} The decoded token payload.
     * @throws {AppError} If the token is invalid.
     */
    async verifyToken(token, secret) {
        return await this.#jwtProviderService.verifyToken(token, secret);
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
     * It uses detectTokenError to determine if the access token is expired or invalid.
     * If the token is expired, it decodes the token, throws an error with the provided expired error message.
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
    async #verifyOrHandleAccessTokenError(token, secret, expiredErrorMsg, invalidErrorMsg) {
        const {expired, error} = await this.#jwtProviderService.detectTokenError(token, secret);
        if (expired) {
            throw new AppError(expiredErrorMsg, httpCodes.UNAUTHORIZED.code, errorCodes.ACCESS_TOKEN_FAILED);
        } else if (error) {
            throw new AppError(invalidErrorMsg, httpCodes.UNAUTHORIZED.code, errorCodes.ACCESS_TOKEN_FAILED);
        }
        return await this.#jwtProviderService.verifyToken(token, secret);
    }

    /**
     * Helper method to verify a token while detecting errors.
     *
     * It uses detectTokenError to determine if the refresh token is expired or invalid.
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
    async #verifyOrHandleRefreshTokenError(token, secret, expiredErrorMsg, invalidErrorMsg) {
        const {expired, error} = await this.#jwtProviderService.detectTokenError(token, secret);
        if (expired) {
            const payload = await this.#jwtProviderService.decodeExpiredToken(token, secret);
            if (payload && payload.sessionId) {
                await this.#sessionService.inactivateSession(payload.sessionId);
            }
            throw new AppError(expiredErrorMsg, httpCodes.UNAUTHORIZED.code, httpCodes.UNAUTHORIZED.name);
        } else if (error) {
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

        if (!user.password || !(await this.#userService.passwordHasherService.verify(password, user.password))) {
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
        const expiredAt = parseTime(this.#config.refreshTokenExpiry);

        session = await this.#sessionService.createSession({
            userId: userId,
            ip: sessionInfo.ip,
            userAgent: sessionInfo.userAgent,
            expiredAt
        });

        return session;
    }

    /**
     * Generates session tokens after successful authentication
     * @param {string} userId - user id
     * @param {SessionInfo} sessionInfo - Session context information
     * @returns {Promise<{accessToken: string, refreshToken: string}>} Token pair
     */
    async generateSessionTokens(userId, sessionInfo) {
        const session = await this.#handleSession(userId, sessionInfo);
        const payload = this.#getPayload(userId, session.id);

        return {
            accessToken: await this.#jwtProviderService.generateToken(
                payload,
                this.#config.accessTokenSecret,
                this.#config.accessTokenExpiry
            ),
            refreshToken: await this.#jwtProviderService.generateToken(
                payload,
                this.#config.refreshTokenSecret,
                this.#config.refreshTokenExpiry
            )
        };
    }

    /**
     * Registers a new user and automatically logs them in.
     *
     * @param {object} data - Registration data.
     * @param {string} [data.firstname] - The user's first name (optional).
     * @param {string} [data.lastname] - The user's last name (optional).
     * @param {string} data.email - The user's email.
     * @param {string} data.password - The user's password.
     * @returns {Promise<Object>} An object containing user data.
     * @throws {AppError} If a user with the given email already exists.
     */
    async register({firstname, lastname, email, password}) {    // Generate OTP and expiration
        const otpCode = generateSecureOTP({
            length: 6,
            charType: 'alphanumeric',
            caseSensitive: true
        });

        return await this.#userService.createLocalUser({
            email,
            password,
            firstname,
            lastname,
            otpCode,
            otpCodeExpiry: this.#config.otpTokenExpiry
        });
    }

    /**
     * Verifies a user's email using the OTP and generates session tokens.
     *
     * @param {string} email - User's email address.
     * @param {string} otpCode - The one-time password provided by the user.
     * @param {SessionInfo} sessionInfo - Session context information.
     * @returns {Promise<{accessToken: string, refreshToken: string}>} Token pair upon successful verification.
     * @throws {AppError} If verification fails.
     */
    async verifyEmail(email, otpCode, sessionInfo) {
        // Retrieve the user along with OTP details.
        const user = await this.#userService.getUserForEmailVerification(email);

        if (!user) {
            throw new AppError(
                statusMessages.EMAIL_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        if (user.isVerified) {
            throw new AppError(
                statusMessages.EMAIL_ALREADY_VERIFIED,
                httpCodes.CONFLICT.code,
                httpCodes.CONFLICT.name
            );
        }

        // Verify that an OTP exists and that it matches.
        if (!user.otpCode || !(await this.#userService.passwordHasherService.verify(otpCode, user.otpCode))) {
            throw new AppError(
                statusMessages.INVALID_OTP,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        // Check that the OTP is not expired.
        if (user.otpCodeExpiresAt < new Date()) {
            throw new AppError(
                statusMessages.OTP_EXPIRED,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        // Mark the email as verified.
        const updatedUser = await this.#userService.markEmailAsVerified(email);

        // Generate and return session tokens.
        return this.generateSessionTokens(updatedUser.id, sessionInfo);
    }

    /**
     * Logs in a user with credentials and generates session tokens
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @param {SessionInfo} sessionInfo - Session context information
     * @returns {Promise<{accessToken: string, refreshToken: string}>} Token pair
     * @throws {AppError} On invalid credentials or session conflict
     */
    async login({email, password}, sessionInfo) {
        const user = await this.#verifyUserCredentials(email, password);
        return this.generateSessionTokens(user.id, sessionInfo);
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
    async verifyAccessToken(accessToken) {
        const payload = await this.#verifyOrHandleAccessTokenError(
            accessToken,
            this.#config.accessTokenSecret,
            statusMessages.ACCESS_TOKEN_EXPIRED,
            statusMessages.ACCESS_TOKEN_EXPIRED
        );

        if (await this.#sessionService.isSessionExpired(payload.sessionId)) {
            throw new AppError(
                statusMessages.ACCESS_TOKEN_EXPIRED,
                httpCodes.UNAUTHORIZED.code,
                errorCodes.ACCESS_TOKEN_FAILED
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
        const payload = await this.#verifyOrHandleRefreshTokenError(
            refreshToken,
            this.#config.refreshTokenSecret,
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
        const payload = await this.#verifyOrHandleRefreshTokenError(
            refreshToken,
            this.#config.refreshTokenSecret,
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
            this.#config.accessTokenSecret,
            this.#config.accessTokenExpiry
        );

        await this.#sessionService.updateLastAccess(payload.sessionId);
        return {accessToken: newAccessToken};
    }
}

module.exports = new JwtAuthService(userService, sessionService, new JwtProviderService(), authConfig);
