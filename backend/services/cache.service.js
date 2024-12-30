const redis = require('redis');
const config = require('../config/config');

class CacheService {
    constructor({ redisUrl = 'redis://127.0.0.1:6379', ttl = 60 } = {}) {
        this.client = redis.createClient({ url: redisUrl });
        this.ttl = ttl;

        this.client.connect().then(() => {
            console.log('Redis client connected.');
        }).catch((err) => {
            console.error('Error connecting to Redis:', err);
            process.exit(1); // Exit process on Redis connection failure
        });
    }

    // Establish connection in an asynchronous method
    async connect() {
        try {
            await this.client.connect(); // Ensure client is connected
            console.log('Redis client connected.');
        } catch (err) {
            console.error('Error connecting to Redis:', err);
            process.exit(1); // Exit on connection failure
        }
    }

    async isConnected() {
        try {
            await this.client.ping();  // Ping Redis to check connection
            return true;
        } catch (err) {
            console.warn('Redis not connected:', err);
            return false;
        }
    }

    async get(key) {
        return await this.client.get(key);
    }

    async set(key, value, ttl =this.ttl) {
        await this.client.set(key, value, { EX: ttl });
    }

    async increment(key) {
        return await this.client.incr(key);
    }

    async expire(key, ttl = this.ttl) {
        await this.client.expire(key, ttl);
    }

    async delete(key) {
        await this.client.del(key);
    }

    async flush() {
        return await this.client.flushDb() // Clear all cache keys
    }
}

module.exports = new CacheService({ redisUrl: config.redisUri });
