const {SOCKET_EVENTS, REDIS, getUserRoom} = require('../../constants/socket.constants');

/**
 * @class NotificationEmitter
 * @description Handles real-time notification delivery through Redis pub/sub and socket.io
 *
 * This class provides methods to emit notifications to individual users or in batches,
 * with automatic online status checking to optimize delivery.
 */
class NotificationEmitter {
    /**
     * @private
     * @type {import('redis').Redis}
     * @description Redis publisher client for emitting socket events
     */
    #publisher;

    /**
     * @private
     * @type {OnlineUserService}
     * @description Service for checking user online status
     */
    #onlineUserService;

    /**
     * Creates a NotificationEmitter instance
     * @param {Object} dependencies - Dependencies
     * @param {OnlineUserService} dependencies.onlineUserService - Online user service
     * @param {import('ioredis').Redis} dependencies.redisClient - Redis client
     */
    constructor({onlineUserService, redisClient} = {}) {
        this.#publisher = redisClient.duplicate();
        this.#onlineUserService = onlineUserService;
    }

    /**
     * Emits a notification to a specific user if they're online
     * @async
     * @param {string} userId - ID of the recipient user
     * @param {EnhancedNotificationOutput | NotificationOutput} notification - Notification to emit
     * @returns {Promise<void>}
     */
    async emitToUser(userId, notification) {
        const isOnline = await this.#onlineUserService.isOnline(userId);
        const start = Date.now();

        if (isOnline) {
            await this.#publisher.publish(
                REDIS.CHANNELS.SOCKET_EVENTS,
                JSON.stringify({
                    type: REDIS.EVENT_TYPES.NOTIFICATION,
                    event: SOCKET_EVENTS.NEW_NOTIFICATION,
                    room: getUserRoom(userId),
                    data: {
                        id: notification.id,
                        type: notification.type,
                        payload: notification.payload,
                        createdAt: notification.createdAt
                    }
                })
            );

            console.log(`[NotificationEmitter] [DELIVERY] User: ${userId}, Duration: ${Date.now() - start}ms`);
        } else {
            console.log(`[NotificationEmitter] [SKIPPED] User ${userId} is offline`);
        }
    }

    /**
     * Emits multiple notifications in sequence
     * @async
     * @param {Array<EnhancedNotificationOutput | NotificationOutput>} notifications - Array of notifications to emit
     * @returns {Promise<void>}
     */
    async emitBatch(notifications) {
        for (const notification of notifications) {
            await this.emitToUser(notification.recipient, notification);
        }
    }
}

module.exports = NotificationEmitter;
