const {REDIS, SOCKET_EVENTS, getUserPresenceRoom} = require('@/constants/socket.constants');

/**
 * @class UserRoomEmitter
 * @description Publishes real-time presence events (user online/offline)
 * to Redis, targeting presence-specific rooms for each user.
 *
 * Used by the backend to notify clients watching a user's online status
 * through Redis pub/sub and Socket.IO.
 */
class UserRoomEmitter {
    /**
     * @private
     * @type {import('ioredis').Redis}
     * @description Redis publisher instance for broadcasting presence events
     */
    #publisher;

    /**
     * Initializes the UserRoomEmitter with a Redis client.
     *
     * @param {{
     *   redisClient: import('ioredis').Redis
     * }} dependencies - Dependencies object containing a Redis client
     */
    constructor({redisClient}) {
        this.#publisher = redisClient.duplicate();
    }

    /**
     * Emits a 'user_online' presence event for the specified user.
     *
     * @param {string} userId - The ID of the user who just came online
     * @returns {Promise<void>}
     */
    async emitUserOnline(userId) {
        await this.#emit(SOCKET_EVENTS.USER.ONLINE, userId);
    }

    /**
     * Emits a 'user_offline' presence event for the specified user.
     *
     * @param {string} userId - The ID of the user who just went offline
     * @returns {Promise<void>}
     */
    async emitUserOffline(userId) {
        await this.#emit(SOCKET_EVENTS.USER.OFFLINE, userId);
    }

    /**
     * Internal helper to publish a presence event to Redis pub/sub.
     *
     * @private
     * @param {string} event - The socket event name (e.g., 'user_online')
     * @param {string} userId - The target user's ID
     * @returns {Promise<void>}
     */
    async #emit(event, userId) {
        await this.#publisher.publish(
            REDIS.CHANNELS.SOCKET_EVENTS,
            JSON.stringify({
                type: REDIS.EVENT_TYPES.USER,
                event,
                room: getUserPresenceRoom(userId),
                data: {userId}
            })
        );
    }
}

module.exports = UserRoomEmitter;
