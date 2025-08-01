/**
 * @class OnlineUserService
 * @description Manages tracking of online users and their active socket connections using Redis.
 *
 * This service:
 * - Maintains a set of online user IDs
 * - Tracks multiple socket connections per user
 * - Provides real-time online status checks
 */
class OnlineUserService {
    /**
     * @private
     * @static
     * @type {string}
     * @description Redis key for the set containing all online user IDs
     */
    static #ONLINE_USERS = 'online_users';

    /**
     * @private
     * @static
     * @type {string}
     * @description Redis key prefix for sets containing socket IDs per user
     */
    static #USER_SOCKETS = 'user_sockets';

    /**
     * @private
     * @type {RedisService}
     * @description Redis Service instance
     */
    #redis;

    /**
     * @private
     * @type {UserRoomEmitter}
     */
    #emitter;

    /**
     * Creates an OnlineUserService instance
     * @param {Object} dependencies
     * @param {RedisService} dependencies.redisService - Redis Service instance
     * @param {UserRoomEmitter} dependencies.userRoomEmitter - userRoom Emitter instance
     *
     */
    constructor({redisService, userRoomEmitter}) {
        this.#redis = redisService;
        this.#emitter = userRoomEmitter;
    }

    /**
     * Adds a user's socket connection to tracking
     * @param {string} userId - Unique user identifier
     * @param {string} socketId - Socket connection ID
     * @returns {Promise<void>}
     *
     * @example
     * await onlineService.add('user123', 'socket456');
     */
    async add(userId, socketId) {
        const key = `${OnlineUserService.#USER_SOCKETS}:{${userId}}`;
        // Add user to online list and store the socketId under a set
        const socketCount = await this.#redis.scard(key);

        await this.#redis.sadd(OnlineUserService.#ONLINE_USERS, userId);
        await this.#redis.sadd(key, socketId);


        if (socketCount === 0) {
            // First socket for this user
            await this.#emitter.emitUserOnline(userId);
        }
    }

    /**
     * Removes a specific socket connection for a user
     * @param {string} userId - Unique user identifier
     * @param {string} socketId - Socket connection ID to remove
     * @returns {Promise<void>}
     *
     * @example
     * await onlineService.remove('user123', 'socket456');
     */
    async remove(userId, socketId) {
        const key = `${OnlineUserService.#USER_SOCKETS}:{${userId}}`;
        // Remove just the current socket
        await this.#redis.srem(key, socketId);

        // If no sockets left for the user, remove them from online_users
        const remainingSockets = await this.#redis.scard(key);
        if (remainingSockets === 0) {
            await this.#redis.srem(OnlineUserService.#ONLINE_USERS, userId);
            await this.#redis.del(key);
            await this.#emitter.emitUserOffline(userId);
        }
    }

    /**
     * Checks if a user is currently online
     * @param {string} userId - User identifier to check
     * @returns {Promise<number>} 1 if member exists, 0 if not
     *
     * @example
     * const online = await onlineService.isOnline('user123');
     * if (online) { ... }
     */
    async isOnline(userId) {
        return this.#redis.sismember(OnlineUserService.#ONLINE_USERS, userId);
    }

    /**
     * Gets all active socket IDs for a user
     * @param {string} userId - User identifier
     * @returns {string[]} Array of socket IDs
     *
     * @example
     * const sockets = await onlineService.getUserSockets('user123');
     * sockets.forEach(socket => { ... });
     */
    async getUserSockets(userId) {
        return this.#redis.smembers(`${OnlineUserService.#USER_SOCKETS}:{${userId}}`);
    }

    /**
     * Gets all currently online user IDs
     * @returns {string[]} Array of user IDs
     *
     * @example
     * const onlineUsers = await onlineService.getOnlineUsers();
     * console.log(`${onlineUsers.length} users online`);
     */
    async getOnlineUsers() {
        return this.#redis.smembers(OnlineUserService.#ONLINE_USERS);
    }

    /**
     * Flushes all online users and their socket mappings
     * Should be called on app shutdown/restart
     * @returns {Promise<void>}
     */
    async clearAllOnlineUsers() {
        const userIds = await this.#redis.smembers(OnlineUserService.#ONLINE_USERS);
        // Delete keys one by one (safe in cluster)
        for (const userId of userIds) {
            await this.#redis.del(`${OnlineUserService.#USER_SOCKETS}:{${userId}}`);
        }

        await this.#redis.del(OnlineUserService.#ONLINE_USERS);
    }
}

module.exports = OnlineUserService;
