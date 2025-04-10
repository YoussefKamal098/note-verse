const {timeUnit, time} = require('shared-utils/date.utils');
const {normalizeUrl} = require('shared-utils/url.utils');
const {parseUserAgent} = require('../utils/userAgent.utils');
const {parseIp} = require('../utils/ip.utils');
const httpCodes = require('../constants/httpCodes');
const httpHeaders = require('../constants/httpHeaders');
const AppError = require('../errors/app.error');

/**
 * @typedef {Object} RateLimiterOptions
 * @property {number} [windowSize] Time window in seconds for rate limiting
 * @property {number} [maxRequests] Maximum allowed requests per window
 * @property {number} [blockTime] Time in seconds to block after exceeding limits
 * @property {function} [generateLimitKey] Custom rate limit key generator
 * @property {function} [generateBlockKey] Custom block key generator
 * @property {Object} [message] Custom error message configuration
 */

/**
 * Unified rate limiting and blocking service using sliding window algorithm.
 * @class
 */
class RateLimiterService {
    #cacheService;
    #windowSize;
    #maxRequests;
    #blockTime;
    #generateLimitKey;
    #generateBlockKey;
    #message;

    /**
     * Create RateLimiterService instance
     * @param {CacheService} cacheService - Cache service with get/set/incr/expire
     * @param {RateLimiterOptions} [options={}] - Configuration options
     */
    constructor(cacheService, {
        windowSize = time({[timeUnit.SECOND]: 60}, timeUnit.SECOND),
        maxRequests = 60,
        blockTime = time({[timeUnit.MINUTE]: 15}, timeUnit.SECOND),
        generateLimitKey,
        generateBlockKey,
        message = {}
    } = {}) {
        this.#cacheService = cacheService;
        this.#windowSize = windowSize;
        this.#maxRequests = maxRequests;
        this.#blockTime = blockTime;
        this.#generateLimitKey = generateLimitKey || this.#defaultGenerateLimitKey;
        this.#generateBlockKey = generateBlockKey || this.#defaultGenerateBlockKey;
        this.#message = {
            text: message.text || httpCodes.TOO_MANY_REQUESTS.message,
            code: message.code || httpCodes.TOO_MANY_REQUESTS.code,
            name: message.name || httpCodes.TOO_MANY_REQUESTS.name
        };
    }

    /**
     * Default rate limit key generator (IP + UA + normalized path)
     * @private
     * @param {Request} req - Express request object
     * @returns {string} Rate limit cache key
     */
    #defaultGenerateLimitKey(req) {
        const {ip, headers, originalUrl} = req;
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;
        const path = originalUrl.split('?')[0];
        return this.#generateKeyComponents(ip, headers[httpHeaders.USER_AGENT], path, baseUrl, 'rate-limited');
    }

    /**
     * Default block key generator (IP + UA + normalized path)
     * @private
     * @param {Request} req - Express request object
     * @returns {string} Block cache key
     */
    #defaultGenerateBlockKey(req) {
        const {ip, headers, originalUrl} = req;
        const baseUrl = `${req.protocol}://${req.get(httpHeaders.HOST)}`;
        const path = originalUrl.split('?')[0];
        return this.#generateKeyComponents(ip, headers[httpHeaders.USER_AGENT], path, baseUrl, 'blocked');
    }

    /**
     * Generate standardized key components
     * @private
     * @param {string} ip - Client IP address
     * @param {string} userAgent - User-Agent header
     * @param {string} path - URL path without query
     * @param {string} baseUrl - Base URL for normalization
     * @param {string} prefix - Key prefix
     * @returns {string} Complete cache key
     */
    #generateKeyComponents(ip, userAgent, path, baseUrl, prefix) {
        const normalizedUrl = normalizeUrl(path, baseUrl);
        const parsedIp = parseIp(ip).ip || 'Unknown-IP';
        const parsedUA = parseUserAgent(userAgent).readable || 'Unknown-UA';

        return `${prefix}:${parsedIp}:${parsedUA}:${normalizedUrl}`;
    }

    /**
     * Check if request should be blocked
     * @private
     * @param {string} blockKey - Generated block key
     * @returns {Promise<boolean>} True if blocked
     */
    async #isBlocked(blockKey) {
        return !!(await this.#cacheService.get(blockKey));
    }

    /**
     * Block requests for configured duration
     * @private
     * @param {string} blockKey - Generated block key
     */
    async #blockUser(blockKey) {
        await this.#cacheService.set(blockKey, 1, this.#blockTime);
    }

    /**
     * Main rate limiting logic
     * @async
     * @param {Request} req - Express request object
     * @returns {Promise<boolean>} True if request should be limited
     */
    async isRateLimited(req) {
        const limitKey = this.#generateLimitKey(req);
        const blockKey = this.#generateBlockKey(req);

        if (await this.#isBlocked(blockKey)) {
            return true;
        }

        const count = await this.#cacheService.increment(limitKey);
        if (count === 1) {
            await this.#cacheService.expire(limitKey, this.#windowSize);
        }

        if (count > this.#maxRequests) {
            await this.#blockUser(blockKey);
            return true;
        }

        return false;
    }

    /**
     * Enforce rate limits or throw formatted error
     * @async
     * @param {Request} req - Express request object
     * @throws {AppError} Rate limit exceeded error
     */
    async limitOrThrow(req) {
        if (await this.isRateLimited(req)) {
            throw new AppError(
                this.#message.text,
                this.#message.code,
                this.#message.name
            );
        }
    }
}

module.exports = RateLimiterService;
