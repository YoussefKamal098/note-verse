const LoginUseCaseBase = require('./loginBase.useCase');
const AppError = require("@/errors/app.error");
const statusMessages = require("@/constants/statusMessages");
const httpCodes = require("@/constants/httpCodes");
const AvatarGenerationTypes = require("@/enums/avatarGenerationTypes.enum");

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
    #googleAuthService
    /**
     * @private
     * @type {import('@/queues/avatarGeneration.queue').AvatarGenerationQueue}
     * @description Avatar generation queue job
     */
    #avatarGenerationQueue;

    /**
     * Creates a new GoogleCallbackUseCase instance.
     * @param {Object} dependencies - Dependency injection object
     * @param {import('@/services/batchers/notification.batcher').NotificationBatcher} dependencies.notificationBatcher - Service for batch processing notifications
     * @param {import('@/services/googleAuth.service').GoogleAuthService} dependencies.googleAuthService - Google authentication service
     * @param {import('@/queues/avatarGeneration.queue').AvatarGenerationQueue} dependencies.avatarGenerationQueue - Avatar generation queue job
     */
    constructor({googleAuthService, notificationBatcher, avatarGenerationQueue}) {
        super({notificationBatcher});
        this.#googleAuthService = googleAuthService;
        this.#avatarGenerationQueue = avatarGenerationQueue;
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
        if (!code || !stateToken) {
            throw new AppError(
                statusMessages.MISSING_GOOGLE_AUTH_DATA,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }

        const {
            accessToken,
            refreshToken,
            user,
            sessionId,
            isNew
        } = await this.#googleAuthService.handleGoogleCallback(code, stateToken, sessionInfo);

        !isNew && await this.notifyLogin(user.id, sessionId);

        // Queue a placeholder avatar
        isNew && await this.#avatarGenerationQueue.addAvatarJob({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            useType: AvatarGenerationTypes.PLACEHOLDER
        });

        return {accessToken, refreshToken};
    }
}

module.exports = GoogleCallbackUseCase;
