const {timeUnit, time, timeFromNow} = require('shared-utils/date.utils');
const httpCodes = require('../constants/httpCodes');
const AppError = require('../errors/app.error');

class BlockerService {
    #cacheService;
    #blockTime;

    constructor(cacheService, blockTime = time({[timeUnit.MINUTE]: 15}, timeUnit.SECOND)) {
        this.#cacheService = cacheService;
        this.#blockTime = blockTime;
    }

    #generateBlockKey(key) {
        return `${key}:blockedUntil:${(time({[timeUnit.SECOND]: this.#blockTime}, timeUnit.MINUTE)).toFixed()}M`;
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
        const blockUntil = timeFromNow({[timeUnit.SECOND]: this.#blockTime});
        await this.#cacheService.set(key, blockUntil);
        await this.#cacheService.expire(key, this.#blockTime);
    }
}

class RateLimiterService {
    #cacheService;
    #blockerService;
    #windowSize;
    #maxRequests;

    constructor(cacheService, blockerService, {
        windowSize = time({[timeUnit.SECOND]: 60}, timeUnit.SECOND),
        maxRequests = 60
    } = {}) {
        this.#cacheService = cacheService;
        this.#blockerService = blockerService;
        this.#windowSize = windowSize;
        this.#maxRequests = maxRequests;
    }

    #generateLimitKey(req) {
        const {ip, headers: {'user-agent': userAgent}, user, originalUrl: url} = req;
        const userId = user ? user.id : 'anonymous';
        return `${ip}:${userAgent}:${userId}:${url}:limit`;
    }

    #generateBlockKey(req) {
        const {ip, headers: {'user-agent': userAgent}, user} = req;
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

    async limitOrThrow(req) {
        if (await this.isRateLimited(req)) {
            throw new AppError(
                httpCodes.TOO_MANY_REQUESTS.message,
                httpCodes.TOO_MANY_REQUESTS.code,
                httpCodes.TOO_MANY_REQUESTS.name
            );
        }
    }
}

module.exports = {RateLimiterService, BlockerService};
