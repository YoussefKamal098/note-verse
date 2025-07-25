const LoginUseCaseBase = require('./loginBase.useCase');

/**
 * Handles Google OAuth 2.0 callback authentication flow including:
 * - State token validation
 * - Authorization code exchange
 * - ID token verification
 * - User synchronization
 * - Conditional login notification
 */
class GoogleCallbackUseCase extends LoginUseCaseBase {
    /**
     * @private
     * @type {import('@/services/googleAuth.service').GoogleAuthService}
     * @description Service handling Google OAuth 2.0 authentication flows.
     */
    #googleAuthService;

    /**
     * Creates a new GoogleCallbackUseCase instance.
     * @param {Object} dependencies - Dependency injection object
     * @param {import('@/services/batchers/notification.batcher').NotificationBatcher} dependencies.notificationBatcher - Service for batch processing notifications
     * @param {import('@/services/googleAuth.service').GoogleAuthService} dependencies.googleAuthService - Google authentication service
     */
    constructor({googleAuthService, notificationBatcher}) {
        super({notificationBatcher});
        this.#googleAuthService = googleAuthService;
    }

    /**
     * Processes the Google OAuth callback.
     * @async
     * @param {Object} params - Callback parameters
     * @param {string} params.code - Google authorization code
     * @param {string} params.stateToken - CSRF protection token
     * @param {SessionInfo} params.sessionInfo - Client session metadata
     * @returns {Promise<{accessToken: string, refreshToken: string}>} Authentication tokens
     * @throws {AppError} When authentication fails
     */
    async execute({code, stateToken, sessionInfo}) {
        const {
            accessToken,
            refreshToken,
            userId,
            sessionId,
            isNew
        } = await this.#googleAuthService.handleGoogleCallback(code, stateToken, sessionInfo);
        
        !isNew && await this.notifyLogin(userId, sessionId);
        return {accessToken, refreshToken};
    }
}

module.exports = GoogleCallbackUseCase;
