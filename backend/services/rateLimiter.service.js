const {timeUnit, time, timeFromNow, compareDates} = require('shared-utils/date.utils');
const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const AppError = require('../errors/app.error');

class BlockerService {
    #cacheService;
    #blockTime;

    constructor(cacheService, blockTime = time({[timeUnit.MINUTE]: 15}, timeUnit.SECOND)) {
        this.#cacheService = cacheService;
        this.#blockTime = blockTime;
    }

    #generateBlockKey(key) {
        return `${key}:blockTime:${(time({[timeUnit.SECOND]: this.#blockTime}, timeUnit.MINUTE)).toFixed()}m`;
    }

    async isBlocked(key) {
        key = this.#generateBlockKey(key);
        const blockUntil = await this.#cacheService.get(key);
        if (blockUntil && compareDates(blockUntil, new Date()) > 0) {
            return true;
        } else if (blockUntil) {
            await this.#cacheService.delete(key);
        }
        return false;
    }

    async blockUser(key) {
        key = this.#generateBlockKey(key);
        const blockUntil = timeFromNow({[timeUnit.SECOND]: this.#blockTime}).toISOString();
        await this.#cacheService.set(key, blockUntil, this.#blockTime);
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
        const {ip, headers: {[httpHeaders.USER_AGENT]: userAgent}, user, originalUrl: url} = req;
        const userId = user ? user.id : 'anonymous';
        return `${ip}:${userAgent}:${userId}:${url}:rate-limited`;
    }

    #generateBlockKey(req) {
        const {ip, headers: {[httpHeaders.USER_AGENT]: userAgent}, user} = req;
        const userId = user ? user.id : 'anonymous';
        return `${ip}:${userAgent}:${userId}:blocked`;
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
