const LoginUseCaseBase = require('./loginBase.useCase');

/**
 * Handles standard email/password authentication flow including:
 * - Credential validation
 * - Session creation
 * - JWT token generation
 * - Login notification
 */
class LoginUseCase extends LoginUseCaseBase {
    /**
     * @private
     * @type {import('@/services/jwtAuth.service').JwtAuthService}
     * @description Service that provides JWT authentication services including user registration, login, token issuance, token verification, token refresh, and logout.
     */
    #jwtAuthService;

    /**
     * Creates a new LoginUseCase instance.
     * @param {Object} dependencies - Dependency injection object
     * @param {import('@/services/notificationBatcher.service')} dependencies.notificationBatcher - Notification service
     * @param {import('@/services/jwtAuth.service')} dependencies.jwtAuthService - JWT authentication service
     */
    constructor({notificationBatcher, jwtAuthService}) {
        super({notificationBatcher});
        this.#jwtAuthService = jwtAuthService;
    }

    /**
     * Executes the email/password login flow.
     * @async
     * @param {Object} credentials - User credentials
     * @param {string} credentials.email - User's email address
     * @param {string} credentials.password - User's password
     * @param {SessionInfo} sessionInfo - Client session metadata (IP, user agent)
     * @returns {Promise<{accessToken: string, refreshToken: string}>} Authentication tokens
     * @throws {AppError} When authentication fails
     */
    async execute({email, password, sessionInfo}) {
        const {accessToken, refreshToken, userId, sessionId} = await this.#jwtAuthService.login({
            email,
            password
        }, sessionInfo);

        await this.notifyLogin(userId, sessionId);
        return {accessToken, refreshToken};
    }
}

module.exports = LoginUseCase;
