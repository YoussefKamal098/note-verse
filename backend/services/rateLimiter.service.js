const AppError = require('../errors/app.error');

class BlockerService {
    #cacheService;
    #blockTime;

    constructor(cacheService, blockTime = 60 * 15) {
        this.#cacheService = cacheService;
        this.#blockTime = blockTime; // in seconds
    }

    #generateBlockKey(key) {
       return `${key}:blockedUntil:${(this.#blockTime/60).toFixed()}d`
    }

    // Check if the user is blocked globally by the block key
    async isBlocked(key) {
        key = this.#generateBlockKey(key);
        const blockEndTime = await this.#cacheService.get(key);
        if (blockEndTime && parseInt(blockEndTime) > Date.now()) {
            return true;
        } else if (blockEndTime) {
            await this.#cacheService.delete(key);
        }
        return false;
    }

    // Block the user by setting a "blockedUntil" key in cache
    async blockUser(key) {
        key = this.#generateBlockKey(key);
        const blockUntil = Date.now() + this.#blockTime * 1000;
        await this.#cacheService.set(key, blockUntil);
        await this.#cacheService.expire(key, this.#blockTime);
    }
}

class RateLimiterService {
    #cacheService;
    #blockerService;
    #windowSize;
    #maxRequests;

    constructor(cacheService, blockerService, { windowSize = 60, maxRequests = 10} = {}) {
        this.#cacheService = cacheService;
        this.#blockerService = blockerService;
        this.#windowSize = windowSize; // in seconds
        this.#maxRequests = maxRequests;
    }

    // Helper method to generate a unique key based on IP, userAgent, and URL for rate limiting
    #generateLimitKey(ip, userAgent, userId, url) {
        return `${ip}:${userAgent}:${userId}:${url}:limit`;
    }

    // Helper method to generate a unique key based on IP, userAgent, and URL for blocking
    #generateBlockKey(ip, userAgent, userId) {
        return `${ip}:${userAgent}:${userId}:block`;
    }

    // Check if the user is rate-limited (exceeds request limit or is blocked)
    async isRateLimited(ip, userAgent, userId, url) {
        const limitKey = this.#generateLimitKey(ip, userAgent, userId, url);
        const blockKey = this.#generateBlockKey(ip, userAgent, userId);

        if (await this.#blockerService.isBlocked(blockKey)) {
            return true;
        }

        const requestCount = await this.#cacheService.increment(limitKey);
        if (requestCount === 1) {
            // First request for this key, set the expiration time
            await this.#cacheService.expire(limitKey, this.#windowSize);
        }

        // If the request count exceeds the maximum, block the user
        if (requestCount > this.#maxRequests) {
            // Block the user if the limit is exceeded
            await this.#blockerService.blockUser(blockKey);
            return true;
        }

        return false;
    }

    // Throw error if the user is rate-limited
    async limitOrThrow(ip, userAgent, userId, url, message = 'Too many requests, please try again later.') {
        if (await this.isRateLimited(ip, userAgent, userId, url)) {
            throw new AppError(message, 429);
        }
    }
}

module.exports = { RateLimiterService, BlockerService };
