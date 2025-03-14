const httpCodes = require("../constants/httpCodes");
const {isSuccessfulStatus} = require("shared-utils/http.utils");
const httpHeaders = require("../constants/httpHeaders");
const {timeUnit, time} = require("shared-utils/date.utils");
const CacheControlBuilder = require("../utils/cacheControlBuilder");
const hasherService = require('../services/hasher.service');
const cacheService = require("../services/cache.service");

class CacheMiddleware {
    /**
     * @private
     * @type {object}
     * @description Instance of the caching service used to store and retrieve cache entries.
     */
    #cacheService;
    /**
     * @private
     * @type {object}
     * @description Instance of the hashing service used to generate ETags for response bodies.
     */
    #hasherService;
    /**
     * @private
     * @type {string}
     * @description The Cache-Control header value built from cache directives.
     */
    #cacheControl;
    /**
     * @private
     * @type {Function}
     * @description Function to generate a unique cache key based on the request.
     */
    #generateCacheKey;
    /**
     * @private
     * @type {number}
     * @description Time-to-live (TTL) in seconds for cache entries.
     */
    #ttl;


    /**
     * Constructs a new CacheMiddleware instance.
     *
     * @param {object} cacheService - The caching service instance used to store and retrieve cache entries.
     * @param {object} hasherService - The hashing service instance used to generate ETags.
     * @param {object} [options={}] - Configuration options for caching.
     * @param {object} [options.cacheControl={}] - Cache control directives.
     * @param {boolean} [options.cacheControl.isPrivate=true] - Marks the response as private.
     * @param {boolean} [options.cacheControl.noCache=true] - If true, instructs clients not to cache the response.
     * @param {boolean} [options.cacheControl.noStore=false] - If true, prevents storage of the response in any cache.
     * @param {boolean} [options.cacheControl.mustRevalidate=true] - If true, forces caches to revalidate the response.
     * @param {boolean} [options.cacheControl.immutable=false] - If true, indicates that the response will not change.
     * @param {boolean} [options.cacheControl.noTransform=false] - If true, prevents caches from modifying the response.
     * @param {number|null} [options.cacheControl.maxAge=null] - Maximum age in seconds the response is considered fresh.
     * @param {number|null} [options.cacheControl.sMaxAge=null] - Shared max age in seconds for public caches.
     * @param {Function} [options.generateCacheKey=(req) => req.originalUrl] - Function to generate a unique cache key based on the request.
     * @param {number} [options.ttl=time({[timeUnit.DAY]: 1})] - Time-to-live (TTL) for cache entries in seconds.
     */
    constructor(cacheService, hasherService, {
        cacheControl: {
            isPrivate = true,
            noCache = true,
            noStore = false,
            mustRevalidate = true,
            immutable = false,
            noTransform = false,
            maxAge = null,
            sMaxAge = null
        } = {},
        generateCacheKey = (req) => req.originalUrl,
        ttl = time({[timeUnit.DAY]: 1})
    } = {}) {
        this.#cacheService = cacheService;
        this.#hasherService = hasherService;
        this.#cacheControl = new CacheControlBuilder()
            .setPrivate(isPrivate)
            .setNoCache(noCache)
            .setNoStore(noStore)
            .setMustRevalidate(mustRevalidate)
            .setImmutable(immutable)
            .setNoTransform(noTransform)
            .setMaxAge(maxAge)
            .setSMaxAge(sMaxAge)
            .build();

        this.#generateCacheKey = generateCacheKey;
        this.#ttl = ttl;
    }

    /**
     * Express middleware entry point for caching responses.
     *
     * Retrieves a cached response if available; otherwise, intercepts the response to cache it.
     *
     * @param {import('express').Request} req - Express request object.
     * @param {import('express').Response} res - Express response object.
     * @param {Function} next - Express next middleware function.
     * @returns {Promise<void>}
     */
    async cache(req, res, next) {
        const cacheKey = this.#generateCacheKey(req);
        const cachedData = await this.#cacheService.get(cacheKey);
        if (cachedData) {
            return this.#handleCacheHit(req, res, cachedData);
        }

        this.#markCacheMiss(res, cacheKey);
        this.#interceptResponse(res, cacheKey);
        next();
    }

    /**
     * Handles a cache hit by serving the cached response.
     *
     * Refreshes the TTL for the cache entry and sets the appropriate HTTP headers.
     * If the client sends a matching ETag in the 'If-None-Match' header, a 304 Not Modified response is returned.
     *
     * @private
     * @param {import('express').Request} req - Express a request object.
     * @param {import('express').Response} res - Express response object.
     * @param {string} cachedData - JSON string containing the cached response data (ETag and body).
     * @returns {Promise<void>}
     */
    async #handleCacheHit(req, res, cachedData) {
        const {etag, body} = JSON.parse(cachedData);

        // Refresh the TTL for the cache key using Redis's EXPIRE command
        const cacheKey = this.#generateCacheKey(req);
        await this.#refreshCacheTTL(cacheKey);

        res.setHeader(httpHeaders.CACHE_CONTROL, this.#cacheControl);
        if (req.headers[httpHeaders.IF_NONE_MATCH] === etag) {
            res.status(httpCodes.NOT_MODIFIED.code).json({message: httpCodes.NOT_MODIFIED.message});
            return;
        }

        res.setHeader(httpHeaders.ETAG, etag);
        res.setHeader(httpHeaders.X_CACHE, "HIT");
        res.status(httpCodes.OK.code).send(body);
    }

    /**
     * Refreshes the TTL (time-to-live) for a given cache key using the caching service.
     *
     * This method attempts to extend the expiration time of a cache entry without re-setting its value.
     *
     * @private
     * @param {string} cacheKey - The cache key to refresh.
     * @returns {Promise<void>}
     */
    async #refreshCacheTTL(cacheKey) {
        try {
            // Refresh the TTL without re-setting the value
            await this.#cacheService.expire(cacheKey, this.#ttl);
        } catch (error) {
            console.error(`Failed to refresh TTL for cache key "${cacheKey}":`, error);
        }
    }

    /**
     * Marks a cache miss by setting appropriate headers and storing the cache key in res.locals.
     *
     * @private
     * @param {object} res - Express response object.
     * @param {string} cacheKey - The cache key that was not found.
     * @returns {void}
     */
    #markCacheMiss(res, cacheKey) {
        res.setHeader(httpHeaders.X_CACHE, "MISS");
        res.locals.cacheKey = cacheKey;
    }

    /**
     * Intercepts the response to cache its body if the response is successful.
     *
     * Overrides the default `res.send` method to cache the response body before sending it.
     *
     * @private
     * @param {object} res - Express response object.
     * @param {string} cacheKey - The key under which the response will be cached.
     * @returns {void}
     */
    #interceptResponse(res, cacheKey) {
        const originalSend = res.send;

        res.send = async (body) => {
            if (isSuccessfulStatus(res.statusCode)) {
                try {
                    await this.#cacheResponse(cacheKey, body);
                } catch (error) {
                    console.error("Failed to cache response:", error);
                }
            }

            // Call the original send method
            await originalSend.call(res, body);
        };
    }

    /**
     * Caches the response body by generating an ETag and storing the response data.
     *
     * The response is stored with a TTL (time-to-live) to ensure it expires after the configured duration.
     *
     * @private
     * @param {string} cacheKey - The cache key under which the response will be stored.
     * @param {string} body - The response body to cache.
     * @returns {Promise<void>}
     */
    async #cacheResponse(cacheKey, body) {
        const etag = await this.#hasherService.generateHash(body);
        await this.#cacheService.set(cacheKey, JSON.stringify({etag, body}), this.#ttl);
    }
}

/**
 * Clears a specific cache entry.
 *
 * @param {string} key - The cache key to delete.
 * @returns {Promise<void>}
 */
const clearCache = async (key) => {
    try {
        await cacheService.delete(key);
    } catch (error) {
        console.error(`Failed to clear cache for key "${key}":`, error);
    }
}

/**
 * Clears all cache entries that match a given pattern.
 *
 * @param {string} pattern - The pattern to match cache keys.
 * @returns {Promise<void>}
 */
const clearCachePattern = async (pattern) => {
    try {
        await cacheService.clearKeysByPattern(pattern);
    } catch (error) {
        console.error(`Failed to clear cache for pattern "${pattern}":`, error);
    }
}

/**
 * Creates a reusable Express caching middleware instance with the provided options.
 *
 * @param {object} [options={}] - Configuration options for caching.
 * @param {object} [options={}] - Configuration options for caching.
 * @param {object} [options.cacheControl={}] - Cache control directives.
 * @param {boolean} [options.cacheControl.isPrivate=true] - Marks the response as private.
 * @param {boolean} [options.cacheControl.noCache=true] - If true, instructs clients not to cache the response.
 * @param {boolean} [options.cacheControl.noStore=false] - If true, prevents storage of the response in any cache.
 * @param {boolean} [options.cacheControl.mustRevalidate=true] - If true, forces caches to revalidate the response.
 * @param {boolean} [options.cacheControl.immutable=false] - If true, indicates that the response will not change.
 * @param {boolean} [options.cacheControl.noTransform=false] - If true, prevents caches from modifying the response.
 * @param {number|null} [options.cacheControl.maxAge=null] - Maximum age in seconds the response is considered fresh.
 * @param {number|null} [options.cacheControl.sMaxAge=null] - Shared max age in seconds for public caches.
 * @param {Function} [options.generateCacheKey=(req) => req.originalUrl] - Function to generate a unique cache key based on the request.
 * @param {number} [options.ttl=time({[timeUnit.DAY]: 1})] - Time-to-live (TTL) for cache entries in seconds.
 * @returns {Function} The Express middleware function for caching.
 */
const createCacheMiddleware = (options = {}) => {
    const cacheMiddleware = new CacheMiddleware(cacheService, hasherService, options);
    return cacheMiddleware.cache.bind(cacheMiddleware);
};


module.exports = {createCacheMiddleware, clearCache, clearCachePattern};
