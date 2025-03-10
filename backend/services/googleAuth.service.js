const {OAuth2Client} = require('google-auth-library');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const userService = require('../services/user.service');
const sessionService = require('../services/session.service');
const jwtAuthService = require('../services/jwtAuth.service');
const googleAuthConfig = require('../config/googleAuthConfig');
const {compareDates, timeUnit, time} = require("shared-utils/date.utils");
const {deepClone, deepFreeze} = require("shared-utils/obj.utils");
const {generateTokenAsync} = require('../utils/crypto.utils');


/**
 * Service handling Google OAuth 2.0 authentication flows with security best practices
 * @class
 * @classdesc Provides complete Google authentication integration including
 * - State token generation/validation for CSRF protection
 * - Authorization code exchange with Google's APIs
 * - ID token verification and payload validation
 * - User profile synchronization with local database
 * - Session token generation through JWT service
 */
class GoogleAuthService {
    /** @private @type {OAuth2Client} Google OAuth2 client instance */
    #oauthClient;
    /** @private
     * @type {import('../services/user.service')} User service instance
     * */
    #userService;
    /** @private
     * @type {import('../services/jwtAuth.service')} JWT authentication service
     * */
    #jwtAuthService;
    /** @private
     * @type {GoogleAuthConfig} Immutable configuration object
     * */
    #config;

    /**
     * Constructs JWT authentication service
     * @param {UserService} userService - User operations service
     * @param {SessionService} sessionService - Session state service
     * @param {JwtAuthService} jwtAuthService - JWT authentication service
     * @param {GoogleAuthConfig} config - Deep frozen configuration object
     */
    constructor(userService, sessionService, jwtAuthService, config) {
        this.#oauthClient = new OAuth2Client({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            redirectUri: config.redirectUri,
        });

        this.#userService = userService;
        this.#jwtAuthService = jwtAuthService;
        this.#config = deepFreeze(deepClone(config));
    }

    /**
     * Immutable authentication configuration
     * @type {GoogleAuthConfig}
     * @readonly
     */
    get config() {
        return this.#config;
    }

    /**
     * Generates a state token for CSRF protection with security parameters
     * @async
     * @param {SessionInfo} sessionInfo - Client session information
     * @returns {Promise<string>} JWT state token containing:
     * - nonce: Cryptographic random value (32 bytes)
     * - ip: Client IP address
     * - userAgent: Client user agent
     * - iss: Client ID for issuer validation
     * @throws {Error} If token generation fails
     */
    async generateStateToken(sessionInfo) {
        const statePayload = {
            nonce: await generateTokenAsync({size: 32}), // Cryptographic nonce
            ip: sessionInfo.ip,                           // Client IP
            userAgent: sessionInfo.userAgent,             // Client user agent
            iss: this.#config.clientId                    // Issuer validation to ensure token origin authenticity
        };

        return await this.#jwtAuthService.generateToken(
            statePayload,
            this.#config.stateTokenSecret,
            this.#config.stateTokenExpiry
        )
    }

    /**
     * Validates state token against session information
     * @async
     * @param {string} token - State token to validate
     * @param {SessionInfo} sessionInfo - Current session information
     * @returns {Promise<Object>} Decoded token payload
     * @throws {AppError} When validation fails:
     * - 400: Invalid token signature/structure
     * - 400: IP/userAgent mismatch or invalid issuer
     */
    async validateStateToken(token, sessionInfo) {
        let statePayload = {};

        try {
            statePayload = await this.#jwtAuthService.verifyToken(token, this.#config.stateTokenSecret);
        } catch (error) {
            throw new AppError(
                statusMessages.INVALID_STATE_TOKEN,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        if (statePayload.ip !== sessionInfo.ip ||
            statePayload.userAgent !== sessionInfo.userAgent ||
            statePayload.iss !== this.#config.clientId
        ) {
            throw new AppError(
                statusMessages.INVALID_STATE_TOKEN,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        return statePayload;
    }

    /**
     * Handles Google OAuth callback with full security validation flow
     * @async
     * @param {string} code - Authorization code from Google
     * @param {string} stateToken - State token for CSRF protection
     * @param {SessionInfo} sessionInfo - Client session information
     * @returns {Promise<{accessToken: string, refreshToken: string}>} Session tokens
     * @throws {AppError} When any validation step fails:
     * - 400: Invalid state token
     * - 400: Invalid authorization code (invalid_grant)
     * - 401: Invalid Google ID token
     * @see {@link https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse|Google OAuth Flow}
     */
    async handleGoogleCallback(code, stateToken, sessionInfo) {
        await this.validateStateToken(stateToken, sessionInfo);

        let tokens;
        try {
            // Exchange the authorization code for tokens
            tokens = (await this.#oauthClient.getToken({code})).tokens;
        } catch (error) {
            if (!error.response || !error.response.data) {
                throw error;
            }

            // Check if error is coming from Google's API (using gaxios error structure)
            if (error.response.data.error === 'invalid_grant') {
                throw new AppError(
                    statusMessages.INVALID_GOOGLE_TOKEN,
                    httpCodes.BAD_REQUEST.code,
                    httpCodes.BAD_REQUEST.name
                );
            } else {
                // Use Google's error_description if available, otherwise a default message
                const message = error.response.data.error_description || 'Google authentication failed due to an unknown error.';
                throw new AppError(message, httpCodes.BAD_REQUEST.code, httpCodes.BAD_REQUEST.name);
            }
        }

        // Verify the ID token from Google
        const ticket = await this.#oauthClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: this.#config.clientId,
        });
        const payload = ticket.getPayload();

        // Validate token payload properties
        if (!payload?.email_verified || !payload.sub || payload.aud !== this.#config.clientId ||
            compareDates(time({[timeUnit.SECOND]: payload.exp}, timeUnit.MILLISECOND), Date.now()) <= 0
        ) {
            throw new AppError(
                statusMessages.INVALID_GOOGLE_TOKEN,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }

        // Create or update the Google user in your system
        const user = await this.#userService.createGoogleUser({
            email: payload.email,
            googleId: payload.sub,
            firstname: payload.given_name,
            lastname: payload.family_name,
        });

        // Generate session tokens for the authenticated user
        return this.#jwtAuthService.generateSessionTokens(user.id, sessionInfo);
    }

    /**
     * Generates Google OAuth 2.0 authorization URL with security parameters
     * @returns {string} Google authorization URL with:
     * - access_type=offline (refresh tokens)
     * - profile+email scopes
     * - prompt=consent (forces fresh authentication)
     */
    getAuthorizationUrl() {
        return this.#oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            prompt: 'consent'
        });
    }
}

module.exports = new GoogleAuthService(userService, sessionService, jwtAuthService, googleAuthConfig);
