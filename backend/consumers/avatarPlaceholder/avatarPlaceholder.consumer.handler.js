/**
 * Handles avatar placeholder generated events.
 * Delegate business logic here (DB ops, socket emit, etc.)
 */
class AvatarPlaceholderConsumerHandler {
    /**
     * @private
     * @type {import('@/services/user.service').UserService} userService
     */
    #userService;

    /**
     * @param {Object} dependencies
     * @param {import('@/services/user.service').UserService} dependencies.userService
     */
    constructor({userService}) {
        this.#userService = userService;
    }

    /**
     * Process the avatar placeholder generation result.
     * @param {AvatarGeneratedPayload} payload
     */
    async handle(payload) {
        console.log('[AVATAR CONSUMER HANDLER] Handling avatar placeholder generation:', payload);
        const {userId, fileId} = payload;

        try {
            await this.#userService.updateUser(userId, {
                avatarPlaceholder: fileId
            });

            console.log(`[AVATAR CONSUMER HANDLER] User '${userId}' avatar placeholder updated with fileId '${fileId}'`);
        } catch (err) {
            console.error(`[AVATAR CONSUMER HANDLER] Failed to update user '${userId}' with avatar placeholder fileId '${fileId}':`, err);
        }
    }
}

module.exports = AvatarPlaceholderConsumerHandler;
