const NotificationType = require('@/enums/notifications.enum');

/**
 * Base class for login-related use cases providing common notification functionality.
 * Handles the core login notification workflow for derived authentication use cases.
 *
 * @abstract
 */
class LoginUseCaseBase {
    /**
     * @private
     * @type {import('@/services/batchers/notification.batcher').NotificationBatcher}
     * @description A batcher for queuing notifications and sending them in optimized batches.
     */
    #notificationBatcher;

    /**
     * Creates a new LoginUseCaseBase instance.
     * @param {Object} dependencies - Dependency injection object
     * @param {import('@/services/batchers/notification.batcher').NotificationBatcher} dependencies.notificationBatcher - Service for batch processing notifications
     */
    constructor({notificationBatcher}) {
        this.#notificationBatcher = notificationBatcher;
    }

    /**
     * Sends a login notification for the authenticated session.
     * @async
     * @param {string} userId - The authenticated user's ID
     * @param {string} sessionId - The new session ID
     * @returns {Promise<void>}
     */
    async notifyLogin(userId, sessionId) {
        await this.#notificationBatcher.add({
            recipient: userId,
            type: NotificationType.LOGIN,
            payload: {sessionId},
        });
    }
}

module.exports = LoginUseCaseBase;
