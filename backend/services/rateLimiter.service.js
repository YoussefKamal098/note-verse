const {timeUnit, time} = require('shared-utils/date.utils');
const {normalizeUrl} = require('shared-utils/url.utils');
const {parseUserAgent} = require('../utils/userAgent.utils');
const {parseIp} = require('../utils/ip.utils');
const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const AppError = require('../errors/app.error');

/**
 * RateLimiterService class for handling rate limiting and blocking of requests.
 * Uses sliding window algorithm with configurable window size and request thresholds.
 */
class RateLimiterService {
    #cacheService;
    #blockerService;
    #windowSize;
    #maxRequests;
    #generateLimitKey;
    #generateBlockKey;

    /**
     * Creates an instance of RateLimiterService.
     *
     * @param {CacheService} cacheService - Cache service instance with increment/expire methods
     * @param {BlockerService} blockerService - Blocker service with block checking/creation
     * @param {RateLimiterOptions} [options={}] - Configuration options
     */
    constructor(cacheService, blockerService, {
        windowSize = time({[timeUnit.SECOND]: 60}, timeUnit.SECOND),
        maxRequests = 60,
        generateLimitKey,
        generateBlockKey,
    } = {}) {
        this.#cacheService = cacheService;
        this.#blockerService = blockerService;
        this.#windowSize = windowSize;
        this.#maxRequests = maxRequests;

        this.#generateLimitKey = generateLimitKey || this.#defaultGenerateLimitKey;
        this.#generateBlockKey = generateBlockKey || this.#defaultGenerateBlockKey;
    }

    /**
     * Generates a default rate limit key combining IP, user agent, user ID, and normalized URL
     *
     * @param {RateLimiterRequestObject} req - Incoming request object
     * @returns {string} - Key format: rate-limited:<ip>:<user-agent>:<user-id>:<normalized-url>
     * @example
     * // Returns `rate-limited:127.0.0.1:Chrome 119:user123:/api/v1/data`
     */
    #defaultGenerateLimitKey(req) {
        const {ip, headers: {[httpHeaders.USER_AGENT]: userAgent}, originalUrl, userId = 'anonymous'} = req;
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;
        const normalizedUrl = normalizeUrl(originalUrl, baseUrl);
        const parsedIp = parseIp(ip);
        return `rate-limited:${parsedIp.ip ? parsedIp.ip : "Unknown IP"}:${parseUserAgent(userAgent).readable}:${userId}:${normalizedUrl}`;
    }

    /**
     * Generates a default block key combining IP, user agent, and user ID
     *
     * @param {RateLimiterRequestObject} req - Incoming request object
     * @returns {string} - Key format: blocked:<ip>:<user-agent>:<user-id>
     * @example
     * // Returns `blocked:127.0.0.1:Chrome 119:user123`
     */
    #defaultGenerateBlockKey(req) {
        const {ip, headers: {[httpHeaders.USER_AGENT]: userAgent}, userId = 'anonymous'} = req;
        const parsedIp = parseIp(ip);
        return `blocked:${parsedIp.ip ? parsedIp.ip : "Unknown IP"}:${parseUserAgent(userAgent).readable}:${userId}`;
    }

    /**
     * Checks if request exceeds rate limits or is blocked
     *
     * @param {RateLimiterRequestObject} req - Incoming request to validate
     * @returns {Promise<boolean>} - true if request should be blocked, false otherwise
     * @throws {Error} - If cache operations fail
     */
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

    /**
     * Enforces rate limiting by throwing error when limits are exceeded
     *
     * @param {RateLimiterRequestObject} req - Incoming request to validate
     * @throws {AppError} - 429 Too Many Requests error when limits exceeded
     * @returns {Promise<void>}
     */
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