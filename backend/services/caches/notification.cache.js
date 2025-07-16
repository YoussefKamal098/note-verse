/**
 * A class for caching notifications and unread counts in Redis with TTL support.
 * Provides methods to set, get, and manage notification data and unread counts.
 */
class NotificationCache {
    /**
     * @private
     * @type {RedisService}
     * */
    #redisService;
    /**
     * @private
     * @type {number}
     * */
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
     * Sets notification data in cache for a specific user, page, and filter criteria.
     * @param {string|number} userId - The user ID to cache notifications for.
     * @param {Object} data - The notification data to cache.
     * @param {number} [page=1] - The page number of notifications.
     * @param {number} [limit=20] - The number of notifications per page.
     * @param {string} [projection=''] - Fields projection for the notifications.
     * @param {Record<any,any>} [filter] - Filter criteria for the notifications.
     * @param {number} [ttl=this.#defaultTTL] - TTL in seconds for the cache entry.
     * @returns {Promise<void>}
     */
    async set(userId, data, page = 1, limit = 20, filter, projection = '', ttl = this.#defaultTTL) {
        const key = this.#getKey(userId, page, limit, filter, projection);
        await this.#redisService.set(key, JSON.stringify(data), ttl);
    }

    /**
     * Gets notification data from cache for a specific user, page, and filter criteria.
     * Automatically refreshes TTL if it's close to expiration.
     * @param {string|number} userId - The user ID to get notifications for.
     * @param {number} [page=1] - The page number of notifications.
     * @param {number} [limit=20] - The number of notifications per page.
     * @param {Record<any,any>} [filter] - Filter criteria for the notifications.
     * @param {string} [projection=''] - Fields projection for the notifications.
     * @returns {Promise<Array|null>} The cached notification data or null if not found.
     */
    async get(userId, page = 1, limit = 20, filter = {}, projection = '') {
        const key = this.#getKey(userId, page, limit, filter, projection);
        const raw = await this.#redisService.get(key);
        const ttl = await this.#redisService.ttl(key);

        // Refresh TTL if it's getting close to expiration
        if (ttl < this.#defaultTTL / 2) {
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
        if (ttl < this.#defaultTTL / 2) {
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
     * Generates the Redis key for notification data.
     * @param {string|number} userId - The user ID.
     * @param {number} page - The page number.
     * @param {number} limit - The number of items per page.
     * @param {Record<any,any>} [filter] - Filter criteria for the notifications.
     * @param {string} projection - Fields projection.
     * @returns {string} The Redis key.
     */
    #getKey(userId, page, limit, filter, projection) {
        // Validate inputs
        if (!userId) throw new Error('userId is required');

        // Create base key
        let key = `user:${userId}:notifications:page:${page}:limit:${limit}`;

        // Add projection if provided
        if (projection) {
            // Sort fields to ensure consistent keys for same projection in different order
            const fields = projection.split(',').map(f => f.trim()).sort();
            key += `:proj:${fields.join(',')}`;
        }

        // Add filter if provided
        if (filter && Object.keys(filter).length > 0) {
            // Sort filter keys to ensure consistent ordering
            const filterKeys = Object.keys(filter).sort();
            const filterParts = filterKeys.map(k => {
                const val = filter[k];
                // Handle different value types appropriately
                if (val === undefined) return `${k}:undefined`;
                if (val === null) return `${k}:null`;
                return `${k}:${JSON.stringify(val)}`;
            });
            key += `:filter:${filterParts.join('|')}`;
        }

        return key;
    }
}

module.exports = NotificationCache;
