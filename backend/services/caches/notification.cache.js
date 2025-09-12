/**
 * A class for caching notifications and unread counts in Redis with TTL support.
 * Provides methods to set, get, and manage notification data and unread counts.
 */
class NotificationCache {
    /**
     * @private
     * @type {RedisService}
     */
    #redisService;

    /**
     * @private
     * @type {number}
     */
    #defaultTTL = 86400; // 24 hours in seconds

    /**
     * Creates a new NotificationCache instance.
     * @param {RedisService} redisService - The Redis service instance.
     * @param {Object} [options] - Configuration options.
     * @param {number} [options.ttl=86400] - Default TTL (time-to-live) in seconds for cache entries.
     */
    constructor(redisService, {ttl = 86400} = {}) {
        this.#redisService = redisService;
        this.#defaultTTL = ttl;
    }

    /**
     * Sets notification data in cache for a specific user, cursor, and filter criteria.
     * @param {string|number} userId - The user ID to cache notifications for.
     * @param {Promise<{data: ReadonlyArray<Readonly<EnhancedNotificationOutput>>, nextCursor: string|null} || null>} data - The notification data to cache.
     * @param {string|null} [cursor=null] - Cursor value (encoded timestamp or ID).
     * @param {number} [limit=20] - The number of notifications requested.
     * @param {Record<string,any>} [filter={}] - Filter criteria for the notifications.
     * @param {string} [projection=''] - Fields projection for the notifications.
     * @param {number} [ttl=this.#defaultTTL] - TTL in seconds for the cache entry.
     * @returns {Promise<void>}
     */
    async set(userId, data, cursor = null, limit = 20, filter = {}, projection = '', ttl = this.#defaultTTL) {
        const key = this.#getKey(userId, cursor, limit, filter, projection);
        await this.#redisService.set(key, JSON.stringify(data), ttl);
    }

    /**
     * Gets notification data from cache for a specific user, cursor, and filter criteria.
     * Automatically refreshes TTL if it's close to expiration.
     * @param {string|number} userId - The user ID to get notifications for.
     * @param {string|null} [cursor=null] - Cursor value (encoded timestamp or ID).
     * @param {number} [limit=20] - The number of notifications requested.
     * @param {Record<string,any>} [filter={}] - Filter criteria for the notifications.
     * @param {string} [projection=''] - Fields projection for the notifications.
     * @returns {Promise<{data: NotificationOutput, nextCursor: string|null} || null>}
     * - `data`: Frozen array of sanitized notifications
     * - `nextCursor`: Encoded cursor for the next page, or null if no more results
     */
    async get(userId, cursor = null, limit = 20, filter = {}, projection = '') {
        const key = this.#getKey(userId, cursor, limit, filter, projection);
        const raw = await this.#redisService.get(key);
        const ttl = await this.#redisService.ttl(key);

        // Refresh TTL if it's getting close to expiration
        if (ttl > 0 && ttl < this.#defaultTTL / 2) {
            await this.#redisService.expire(key, this.#defaultTTL);
        }

        return raw ? JSON.parse(raw) : null;
    }

    /**
     * Clears all notification cache entries for a specific user.
     * @param {string|number} userId - The user ID to clear notifications for.
     * @returns {Promise<void>}
     */
    async clear(userId) {
        const pattern = `user:${userId}:notifications:*`;
        await this.#redisService.clearKeysByPattern(pattern);
    }

    /**
     * Sets the unread notification count for a user.
     * @param {string|number} userId - The user ID to set the count for.
     * @param {number} count - The unread count value.
     * @param {number} [ttl=this.#defaultTTL] - TTL in seconds for the count entry.
     * @returns {Promise<void>}
     */
    async setUnreadCount(userId, count, ttl = this.#defaultTTL) {
        const key = this.#getUnreadCountKey(userId);
        // Set the count with TTL
        await this.#redisService.set(key, count.toString(), ttl);
    }

    /**
     * Gets the unread notification count for a user.
     * Automatically refreshes TTL if it's close to expiration.
     * @param {string|number} userId - The user ID to get the count for.
     * @returns {Promise<number|undefined>} The unread count or undefined if not set.
     */
    async getUnreadCount(userId) {
        const key = this.#getUnreadCountKey(userId);
        const [count, ttl] = await Promise.all([
            this.#redisService.get(key),
            this.#redisService.ttl(key)
        ]);

        if (count === null) return undefined;

        // Refresh TTL if it's getting close to expiration
        if (ttl > 0 && ttl < this.#defaultTTL / 2) {
            await this.#redisService.expire(key, this.#defaultTTL);
        }

        return parseInt(count, 10);
    }

    /**
     * Increments the unread notification count for a user.
     * @param {string|number} userId - The user ID to increment the count for.
     * @param {number} [amount=1] - The amount to increment by.
     * @returns {Promise<void>}
     */
    async incrementUnreadCount(userId, amount = 1) {
        const key = this.#getUnreadCountKey(userId);
        const exists = await this.#redisService.exists(key);

        if (exists) {
            await this.#redisService.incrby(key, amount);
        }
    }

    /**
     * Decrements the unread notification count for a user.
     * @param {string|number} userId - The user ID to decrement the count for.
     * @param {number} [amount=1] - The amount to decrement by.
     * @returns {Promise<void>}
     */
    async decrementUnreadCount(userId, amount = 1) {
        const key = this.#getUnreadCountKey(userId);
        const exists = await this.#redisService.exists(key);

        if (exists) {
            await this.#redisService.decrby(key, amount);
        }
        // If key doesn't exist, do nothing (count is effectively 0)
    }

    /**
     * @private
     * Generates the Redis key for unread count.
     * @param {string|number} userId - The user ID.
     * @returns {string} The Redis key.
     */
    #getUnreadCountKey(userId) {
        return `user:${userId}:notifications:unread_count`;
    }

    /**
     * @private
     * Generates the Redis key for notification data (cursor-based).
     * @param {string|number} userId - The user ID.
     * @param {string|null} cursor - Cursor value (base64 or null).
     * @param {number} limit - The number of items requested.
     * @param {Record<string,any>} [filter={}] - Filter criteria.
     * @param {string} projection - Projection string.
     * @returns {string} The Redis key.
     */
    #getKey(userId, cursor, limit, filter, projection) {
        if (!userId) throw new Error("userId is required");

        let key = `user:${userId}:notifications:limit:${limit}`;

        if (cursor) {
            key += `:cursor:${cursor}`;
        }

        if (projection) {
            const fields = projection.split(",").map(f => f.trim()).sort();
            key += `:proj:${fields.join(",")}`;
        }

        // Add filter if provided
        if (filter && Object.keys(filter).length > 0) {
            // Sort filter keys to ensure consistent ordering
            const filterKeys = Object.keys(filter).sort();
            const filterParts = filterKeys.map(k => `${k}:${JSON.stringify(filter[k])}`);
            key += `:filter:${filterParts.join("|")}`;
        }

        return key;
    }

    /**
     * Sets the unseen notification count for a user.
     * @param {string|number} userId - The user ID to set the count for.
     * @param {number} count - The unseen count value.
     * @param {number} [ttl=this.#defaultTTL] - TTL in seconds for the count entry.
     * @returns {Promise<void>}
     */
    async setUnseenCount(userId, count, ttl = this.#defaultTTL) {
        const key = this.#getUnseenCountKey(userId);
        await this.#redisService.set(key, count.toString(), ttl);
    }

    /**
     * Gets the unseen notification count for a user.
     * Automatically refreshes TTL if it's close to expiration.
     * @param {string|number} userId - The user ID to get the count for.
     * @returns {Promise<number|undefined>} The unseen count or undefined if not set.
     */
    async getUnseenCount(userId) {
        const key = this.#getUnseenCountKey(userId);
        const [count, ttl] = await Promise.all([
            this.#redisService.get(key),
            this.#redisService.ttl(key)
        ]);

        if (count === null) return undefined;

        // Refresh TTL if close to expiry
        if (ttl > 0 && ttl < this.#defaultTTL / 2) {
            await this.#redisService.expire(key, this.#defaultTTL);
        }

        return parseInt(count, 10);
    }

    /**
     * Increments the unseen notification count for a user.
     * @param {string|number} userId - The user ID to increment the count for.
     * @param {number} [amount=1] - The amount to increment by.
     * @returns {Promise<void>}
     */
    async incrementUnseenCount(userId, amount = 1) {
        const key = this.#getUnseenCountKey(userId);
        const exists = await this.#redisService.exists(key);

        if (exists) {
            await this.#redisService.incrby(key, amount);
        }
    }

    /**
     * @private
     * Generates the Redis key for unseen count.
     * @param {string|number} userId - The user ID.
     * @returns {string} The Redis key.
     */
    #getUnseenCountKey(userId) {
        return `user:${userId}:notifications:unseen_count`;
    }
}

module.exports = NotificationCache;
