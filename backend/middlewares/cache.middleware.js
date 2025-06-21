const httpCodes = require("../constants/httpCodes");
const {isSuccessfulStatus} = require("shared-utils/http.utils");
const httpHeaders = require("../constants/httpHeaders");
const {timeUnit, time} = require("shared-utils/date.utils");
const CacheControlBuilder = require("../utils/cacheControlBuilder");
const container = require("../container");

// Constants for cache headers
const CACHE_HIT = "HIT";
const CACHE_MISS = "MISS";
const CACHE_ERROR = "ERROR";

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
        try {
            const cacheKey = this.#generateCacheKey(req);
            const cachedData = await this.#cacheService.get(cacheKey);

            if (cachedData) {
                return this.#handleCacheHit(req, res, cachedData, cacheKey);
            }

            this.#markCacheMiss(res, cacheKey);
            this.#interceptResponse(res, cacheKey);
            return next();
        } catch (error) {
            this.#handleCacheError(res, error);
            return next();
        }
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
     * @param {string} cacheKey - cache key.
     * @returns {Promise<void>}
     */
    async #handleCacheHit(req, res, cachedData, cacheKey) {
        const {etag, body} = JSON.parse(cachedData);

        try {
            await this.#refreshCacheTTL(cacheKey);

            res.setHeader(httpHeaders.CACHE_CONTROL, this.#cacheControl);

            if (req.headers[httpHeaders.IF_NONE_MATCH] === etag) {
                res.status(httpCodes.NOT_MODIFIED.code).end();
                return;
            }

            res.setHeader(httpHeaders.ETAG, etag)
                .setHeader(httpHeaders.X_CACHE, CACHE_HIT)
                .status(httpCodes.OK.code)
                .send(body);
        } catch (error) {
            this.#handleCacheError(res, error);
            res.status(httpCodes.OK.code).send(body); // Fallback to cached body
        }
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
            await this.#cacheService.expire(cacheKey, this.#ttl);
        } catch (error) {
            console.error(`Cache TTL refresh failed: ${cacheKey}`, error);
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
        res.setHeader(httpHeaders.X_CACHE, CACHE_MISS)
            .setHeader(httpHeaders.CACHE_CONTROL, this.#cacheControl);
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
            try {
                if (isSuccessfulStatus(res.statusCode)) {
                    await this.#cacheResponse(cacheKey, body);
                }
            } catch (error) {
                console.error("Response caching failed", error);
                res.setHeader(httpHeaders.X_CACHE, CACHE_ERROR);
            } finally {
                await originalSend.call(res, body);
            }
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
        try {
            const etag = await this.#hasherService.generateHash(body);
            await this.#cacheService.set(
                cacheKey,
                JSON.stringify({etag, body}),
                this.#ttl
            );
        } catch (error) {
            console.error("Cache set operation failed", error);
            throw error;
        }
    }

    /**
     * Handles cache-related errors by setting appropriate headers and logging the error.
     *
     * This method is called when an error occurs during cache operations. It:
     * 1. Logs the error to the console
     * 2. Sets the X-Cache header to indicate an error state
     * 3. Sets Cache-Control to 'no-store' to prevent caching of the errored response
     *
     * @private
     * @param {import('express').Response} res - Express response object
     * @param {Error} error - The error object that occurred during cache operations
     * @returns {void}
     */
    #handleCacheError(res, error) {
        console.error("Cache middleware error", error);
        res.setHeader(httpHeaders.X_CACHE, CACHE_ERROR)
            .setHeader(httpHeaders.CACHE_CONTROL, "no-store");
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
        const cacheService = container.resolve('cacheService');
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
        const cacheService = container.resolve('cacheService');
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
    const cacheMiddleware = new CacheMiddleware(
        container.resolve('cacheService'),
        container.resolve('hasherService'),
        options
    );
    return cacheMiddleware.cache.bind(cacheMiddleware);
};


module.exports = {createCacheMiddleware, clearCache, clearCachePattern};
