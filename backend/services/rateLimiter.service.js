const {timeUnit, time} = require('shared-utils/date.utils');
const {normalizeUrl} = require('../utils/url.utils');
const {parseUserAgent} = require('../utils/userAgent.utils');
const {parseIp} = require('../utils/ip.utils');
const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const AppError = require('../errors/app.error');

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
        const {ip, headers: {[httpHeaders.USER_AGENT]: userAgent}, user, originalUrl} = req;
        const userId = user ? user.id : 'anonymous';

        // Build a base URL from the request to ensure proper URL normalization.
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;

        // Normalize the original URL so that equivalent URLs generate the same cache key.
        const normalizedUrl = normalizeUrl(originalUrl, baseUrl);

        return `rate-limited:${parseIp(ip).ip}:${parseUserAgent(userAgent).readable}:${userId}:${normalizedUrl}`;
    }

    #generateBlockKey(req) {
        const {ip, headers: {[httpHeaders.USER_AGENT]: userAgent}, user} = req;
        const userId = user ? user.id : 'anonymous';
        return `blocked:${parseIp(ip).ip}:${parseUserAgent(userAgent).readable}:${userId}`;
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

module.exports = RateLimiterService;
