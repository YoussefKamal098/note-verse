const {Reactions} = require("@/constants/reaction.constants");

/**
 * Enhanced ReactionCache service with automatic expiry management
 * Supports atomic operations via Redis multi/transaction and pipeline
 *
 * Features:
 * - Automatic TTL refresh on any operation
 * - Centralized count key management
 * - Thread-safe atomic operations with MULTI/EXEC
 * - Pipeline support for batch operations
 * - Configurable expiry times
 */
class ReactionCache {
    /**
     * @type {import('@/services/redis.service').RedisService}
     * @private
     */
    #redis;

    /**
     * @type {import('@/repositories/reaction.repository').ReactionRepository}
     * @private
     */
    #reactionRepo;

    /**
     * Default TTL in seconds (24 hours)
     * @type {number}
     * @private
     */
    #defaultTTL = 24 * 60 * 60;

    /**
     * Creates an instance of ReactionCache
     * @param {Object} dependencies
     * @param {import('@/repositories/reaction.repository').ReactionRepository} dependencies.reactionRepo - Reaction repository instance
     * @param {import('@/services/redis.service').RedisService} dependencies.redisService - Redis service instance     * @param {number} [dependencies.defaultTTL=86400] - Default TTL in seconds
     */
    constructor({redisService, reactionRepo, defaultTTL = 86400}) {
        this.#redis = redisService;
        this.#reactionRepo = reactionRepo
        this.#defaultTTL = defaultTTL;
    }

    /**
     * Generate count key for note
     * @param {string} noteId
     * @returns {string}
     */
    countKey(noteId) {
        return `reaction:note:{${noteId}}:counts`;
    }

    /**
     * Refresh TTL for count key
     * @private
     * @param {string} key
     * @param {import('ioredis').ChainableCommander?} multi - Redis multi transaction
     * @returns {Promise<void>}
     */
    async #refreshExpiry(key, multi) {
        if (multi) await multi.expire(key, this.#defaultTTL)
        else await this.#redis.expire(key, this.#defaultTTL);
    }

    /**
     * Execute operation with automatic TTL refresh
     * @private
     * @param {string} noteId
     * @param {Function} operation - Async function that performs Redis operation
     * @param {import('ioredis').ChainableCommander?} multi - Redis multi transaction
     * @returns {Promise<any>}
     */
    async #withExpiry(noteId, operation, multi) {
        const key = this.countKey(noteId);
        const result = await operation(key);

        // Refresh TTL after any operation
        await this.#refreshExpiry(key, multi);

        return result;
    }

    /**
     * Create a multi transaction for atomic operations
     * @returns {import('ioredis').ChainableCommander} Redis multi transaction object
     */
    createMulti() {
        return this.#redis.multi();
    }

    /**
     * Execute multi transaction and refresh TTL
     * @param {import('ioredis').ChainableCommander} multi - Redis multi transaction
     * @param {string} noteId - Note ID for TTL refresh
     * @returns {Promise<Array>} Transaction results
     */
    async execMulti(multi, noteId) {
        const results = await multi.exec();
        await this.#refreshExpiry(this.countKey(noteId));
        return results;
    }


    /**
     * Set reaction counts with expiry
     * @param {string} noteId
     * @param {ReactionCounts} counts
     * @returns {Promise<void>}
     */
    async setCounts(noteId, counts) {
        const key = this.countKey(noteId);
        const operation = (tx) => {
            const data = {};
            for (const type of Object.values(Reactions)) {
                data[type] = counts[type] || 0;
            }
            tx.hmset(key, data);
        };

        await this.#withExpiry(noteId, async () => {
            const tx = this.createMulti();
            operation(tx);
            await this.execMulti(tx, noteId);
        });
    }

    /**
     * Get reaction counts and refresh TTL
     * @param {string} noteId
     * @returns {Promise<ReactionCounts | null>}
     */
    async getCounts(noteId) {
        return await this.#withExpiry(noteId, async (key) => {
            const hasCache = await this.hasCache(noteId);
            if (!hasCache) {
                const counts = await this.#reactionRepo.getNoteCounts(noteId);
                if (!counts) return null;
                await this.setCounts(noteId, counts);
                return counts
            }

            const obj = await this.#redis.hgetall(key);
            const data = {};
            for (const type of Object.values(Reactions)) {
                data[type] = Number(obj[type] || 0);
            }
            return data;
        });
    }

    /**
     * Check if cache exists for note
     * @param {string} noteId
     * @returns {Promise<boolean>}
     */
    async hasCache(noteId) {
        const key = this.countKey(noteId);
        const exists = await this.#redis.exists(key);

        // Refresh TTL if it exists
        if (exists) {
            await this.#refreshExpiry(key);
        }

        return exists === 1;
    }

    /**
     * Bulk set reaction counts for many notes at once.
     * Accepts object: { noteId1: counts1, noteId2: counts2, ... }
     *
     * @param {Object<string, ReactionCounts>} noteCountsMap
     * @returns {Promise<void>}
     */
    async bulkSetCounts(noteCountsMap) {
        const pipeline = this.#redis.pipeline();

        for (const [noteId, counts] of Object.entries(noteCountsMap)) {
            const key = this.countKey(noteId);
            // normalize counts object
            const normalized = {};
            for (const type of Object.values(Reactions)) {
                normalized[type] = counts[type] || 0;
            }

            // HMSET
            pipeline.hmset(key, normalized);
            // TTL refresh
            pipeline.expire(key, this.#defaultTTL);
        }

        await pipeline.exec();
    }
}

module.exports = ReactionCache;
