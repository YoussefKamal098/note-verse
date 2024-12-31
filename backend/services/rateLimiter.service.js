const AppError = require('../errors/app.error');

class BlockerService {
    #cacheService;
    #blockTime;

    constructor(cacheService, blockTime = 60 * 15) {
        this.#cacheService = cacheService;
        this.#blockTime = blockTime; // in seconds
    }

    #generateBlockKey(key) {
        return `${key}:blockedUntil:${(this.#blockTime / 60).toFixed()}d`;
    }

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

    constructor(cacheService, blockerService, { windowSize = 60, maxRequests = 10 } = {}) {
        this.#cacheService = cacheService;
        this.#blockerService = blockerService;
        this.#windowSize = windowSize; // in seconds
        this.#maxRequests = maxRequests;
    }

    #generateLimitKey(req) {
        const { ip, headers: { 'user-agent': userAgent }, user, originalUrl: url } = req;
        const userId = user ? user.id : 'anonymous';
        return `${ip}:${userAgent}:${userId}:${url}:limit`;
    }

    #generateBlockKey(req) {
        const { ip, headers: { 'user-agent': userAgent }, user } = req;
        const userId = user ? user.id : 'anonymous';
        return `${ip}:${userAgent}:${userId}:block`;
    }

    async isRateLimited(req) {
        const limitKey = this.#generateLimitKey(req);
        const blockKey = this.#generateBlockKey(req);

        if (await this.#blockerService.isBlocked(blockKey)) {
            return true;
        }

        const requestCount = await this.#cacheService.increment(limitKey);
        if (requestCount === 1) {
            await this.#cacheService.expire(limitKey, this.#windowSize);
        }

        if (requestCount > this.#maxRequests) {
            await this.#blockerService.blockUser(blockKey);
            return true;
        }

        return false;
    }

    async limitOrThrow(req, message = 'Too many requests, please try again later.') {
        if (await this.isRateLimited(req)) {
            throw new AppError(message, 429);
        }
    }
}

module.exports = { RateLimiterService, BlockerService };
