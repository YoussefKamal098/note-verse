const {OAuth2Client} = require('google-auth-library');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const {compareDates, timeUnit, time} = require("shared-utils/date.utils");
const {deepClone, deepFreeze} = require("shared-utils/obj.utils");
const {generateTokenAsync} = require('../utils/crypto.utils');
const authProvider = require("../enums/auth.enum");

/**
 * Service handling Google OAuth 2.0 authentication flows with security best practices.
 * Provides complete Google authentication integration including:
 * - State token generation/validation for CSRF protection
 * - Authorization code exchange with Google's APIs
 * - ID token verification and payload validation
 * - User profile synchronization with local database
 * - Session token generation through JWT service
 */
class GoogleAuthService {
    /** @private
     *  @type {OAuth2Client} Google OAuth2 client instance
     */
    #oauthClient;
    /** @private
     *  @type {import('@/services/user.service').UserService} User service instance
     */
    #userService;
    /** @private
     * @type {import('@/services/jwtAuth.service').JwtAuthService} JWT authentication service
     */
    #jwtAuthService;
    /** @private
     * @type {GoogleAuthConfig} Immutable configuration object
     */
    #config;

    /**
     * Constructs the GoogleAuthService.
     * @param {UserService} userService - Service for user operations.
     * @param {SessionService} sessionService - Service for session state management.
     * @param {JwtAuthService} jwtAuthService - Service for JWT authentication.
     * @param {GoogleAuthConfig} config - Deep frozen configuration object.
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
     * Gets the immutable authentication configuration.
     * @returns {GoogleAuthConfig} The configuration object.
     */
    get config() {
        return this.#config;
    }

    /**
     * Generates a state token for CSRF protection.
     * @async
     * @param {SessionInfo} sessionInfo - Client session information.
     * @returns {Promise<string>} JWT state token containing nonce, ip, userAgent, and issuer.
     * @throws {Error} If token generation fails.
     */
    async generateStateToken(sessionInfo) {
        const statePayload = {
            nonce: await generateTokenAsync({size: 32}),
            ip: sessionInfo.ip,
            userAgent: sessionInfo.userAgent,
            iss: this.#config.clientId
        };

        return await this.#jwtAuthService.generateToken(
            statePayload,
            this.#config.stateTokenSecret,
            this.#config.stateTokenExpiry
        );
    }

    /**
     * Validates the provided state token against session information.
     * @async
     * @param {string} token - State token to validate.
     * @param {SessionInfo} sessionInfo - Current session information.
     * @returns {Promise<Object>} Decoded token payload.
     * @throws {AppError} When token validation fails or session mismatch occurs.
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

        if (
            statePayload.ip !== sessionInfo.ip ||
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
     * Handles the Google OAuth callback with full security validation flow.
     * @async
     * @param {string} code - Authorization code from Google.
     * @param {string} stateToken - State token for CSRF protection.
     * @param {SessionInfo} sessionInfo - Client session information.
     * @returns {Promise<{user: {id:string, firstname:string, lastname:string}, accessToken: string, refreshToken: string, sessionId:string, isNew: boolean}>}
     * @throws {AppError} When validation or token exchange fails.
     */
    async handleGoogleCallback(code, stateToken, sessionInfo) {
        // Validate state token
        await this.validateStateToken(stateToken, sessionInfo);

        // Exchange authorization code for tokens
        const tokens = await this.exchangeAuthorizationCode(code);

        // Verify and validate the Google ID token
        const payload = await this.verifyAndValidateGoogleToken(tokens);

        // Synchronize the user with the local database
        const result = await this.syncUser(payload);
        const user = result.user;

        // Generate session tokens for the authenticated user
        return {
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname
            },
            isNew: !result.exist,
            ...(await this.#jwtAuthService.generateSessionTokens(user.id, sessionInfo))
        };
    }

    /**
     * Exchanges an authorization code for tokens using Google's API.
     * @async
     * @param {string} code - Authorization code received from Google.
     * @returns {Promise<Object>} Tokens received from Google.
     * @throws {AppError} When the exchange fails or returns an invalid grant.
     */
    async exchangeAuthorizationCode(code) {
        try {
            const {tokens} = await this.#oauthClient.getToken({code});
            return tokens;
        } catch (error) {
            if (!error.response || !error.response.data) {
                throw error;
            }
            if (error.response.data.error === 'invalid_grant') {
                throw new AppError(
                    statusMessages.INVALID_GOOGLE_TOKEN,
                    httpCodes.BAD_REQUEST.code,
                    httpCodes.BAD_REQUEST.name
                );
            }
            const message = error.response.data.error_description ||
                'Google authentication failed due to an unknown error.';
            throw new AppError(message, httpCodes.BAD_REQUEST.code, httpCodes.BAD_REQUEST.name);
        }
    }

    /**
     * Verifies the Google ID token and validates its payload.
     * @async
     * @param {Object} tokens - Tokens object containing the Google ID token.
     * @returns {Promise<Object>} Decoded token payload.
     * @throws {AppError} When the token is invalid or expired.
     */
    async verifyAndValidateGoogleToken(tokens) {
        const ticket = await this.#oauthClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: this.#config.clientId,
        });
        const payload = ticket.getPayload();

        const tokenExpired = compareDates(
            time({[timeUnit.SECOND]: payload.exp}, timeUnit.MILLISECOND),
            Date.now()
        ) <= 0;

        if (!payload?.email_verified || !payload.sub || payload.aud !== this.#config.clientId || tokenExpired) {
            throw new AppError(
                statusMessages.INVALID_GOOGLE_TOKEN,
                httpCodes.UNAUTHORIZED.code,
                httpCodes.UNAUTHORIZED.name
            );
        }
        return payload;
    }

    /**
     * Synchronizes the Google user profile with the local database.
     * @async
     * @param {Object} payload - Decoded Google token payload containing user details.
     * @returns {Promise<Readonly<{ user: Object, exist: boolean }>>}
     * An object with:
     * - `user`: the existing or newly created user document.
     * - `exist`: `true` if the user already existed, `false` if a new user was created.
     */
    async syncUser(payload) {
        return await this.#userService.getOrCreateProviderUser({
            email: payload.email,
            providerId: payload.sub,
            firstname: payload.given_name,
            lastname: payload.family_name,
            avatarUrl: payload.picture
        }, authProvider.GOOGLE);
    }

    /**
     * Generates the Google OAuth 2.0 authorization URL.
     * @returns {string} The URL used to initiate the Google OAuth 2.0 flow.
     */
    getAuthorizationUrl() {
        return this.#oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            prompt: 'consent',
            // prompt: 'select_account', / Forces account selection even if the user is already signed in
            // login_hint: email,   // Pre-fills the email input on Google's login page (optional UX improvement)
            include_granted_scopes: true // Enables incremental authorization by reusing previously granted scopes
        });
    }
}

module.exports = GoogleAuthService;
