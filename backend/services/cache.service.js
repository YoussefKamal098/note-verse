const redis = require('redis');
const {timeUnit, time} = require('shared-utils/date.utils');

class CacheService {
    #client;
    #ttl;

    constructor({redisUrl = 'redis://127.0.0.1:6379', ttl = time({[timeUnit.HOUR]: 1})} = {}) {
        this.#client = redis.createClient({url: redisUrl});
        this.#ttl = ttl;
    }

    // Establish connection in an asynchronous method
    async connect() {
        try {
            await this.#client.connect(); // Ensure a client is connected
            console.log('Redis client connected.');
        } catch (err) {
            console.error('Redis connection failed:', err.message);
            throw new Error(`Cache service connection error: ${err}`);
        }
    }

    async isConnected() {
        try {
            await this.#client.ping();  // Ping Redis to check connection
            return true;
        } catch (err) {
            console.warn('Redis not connected:', err);
            return false;
        }
    }

    async get(key) {
        return await this.#client.get(key);
    }

    async set(key, value, ttl = this.#ttl) {
        await this.#client.set(key, value, {EX: ttl});
    }

    async increment(key) {
        return await this.#client.incr(key);
    }

    async expire(key, ttl = this.#ttl) {
        await this.#client.expire(key, ttl);
    }

    async delete(key) {
        await this.#client.del(key);
    }

    async clearKeysByPattern(pattern) {
        const SCAN_COUNT = 100;
        let cursor = 0;
        do {
            const {cursor: newCursor, keys} = await this.#client.scan(cursor, {
                MATCH: pattern,
                COUNT: SCAN_COUNT,
            });
            cursor = newCursor;

            if (keys.length) {
                await Promise.all(keys.map(key => this.#client.del(key)));
            }
        } while (cursor !== 0);
    }

    async close() {
        try {
            await this.#client.quit(); // Gracefully close the Redis connection
            console.log('Redis client disconnected.');
        } catch (err) {
            console.error('Error disconnecting Redis client:', err);
        }
    }

    async flush() {
        return await this.#client.flushDb() // Clear all cache keys
    }
}

module.exports = CacheService;
