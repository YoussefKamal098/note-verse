const httpCodes = require("../constants/httpCodes");
const {isSuccessfulStatus} = require("shared-utils/http.utils");
const httpHeaders = require("../constants/httpHeaders");
const {timeUnit, time} = require("shared-utils/date.utils");
const hasherService = require('../services/hasher.service');
const cacheService = require("../services/cache.service");

class CacheMiddleware {
    #cacheService;
    #hasherService;
    #cacheControl;
    #generateCacheKey;
    #ttl;

    constructor(cacheService, hasherService, {
        cacheControl: {
            isPrivate = true,
            noCache = true,
            noStore = false,
            mustRevalidate = false,
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
        this.#cacheControl = Object.freeze(Object.freeze({
            private: isPrivate,
            noCache,
            noStore,
            mustRevalidate,
            immutable,
            noTransform,
            maxAge,
            sMaxAge
        }));
        this.#generateCacheKey = generateCacheKey;
        this.#ttl = ttl;
    }

    /**
     * Middleware entry point for caching and response retrieval.
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
     * Handle a cache hit scenario.
     */
    async #handleCacheHit(req, res, cachedData) {
        const {etag, body} = JSON.parse(cachedData);

        // Refresh the TTL for the cache key using Redis's EXPIRE command
        const cacheKey = this.#generateCacheKey(req);
        await this.#refreshCacheTTL(cacheKey);

        res.setHeader(httpHeaders.CACHE_CONTROL, this.#getCacheControlHeader());
        if (req.headers[httpHeaders.IF_NONE_MATCH] === etag) {
            return res.status(httpCodes.NOT_MODIFIED.code).json({message: httpCodes.NOT_MODIFIED.message});
        }

        res.setHeader(httpHeaders.ETAG, etag);
        res.setHeader(httpHeaders.X_CACHE, "HIT");
        res.status(httpCodes.OK.code).send(body);
    }

    /**
     * Refresh the TTL for a cache key using Redis's EXPIRE command.
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
     * Generate the Cache-Control header value.
     */
    #getCacheControlHeader() {
        const directives = [];

        // Handle no-store (overrides everything)
        if (this.#cacheControl.noStore) {
            directives.push("no-store");
            return directives.join(", "); // No other directives are allowed
        }

        // Handle public/private (mutually exclusive)
        if (this.#cacheControl.private) {
            directives.push("private");
        } else {
            directives.push("public");
        }

        // Handle no-cache (overrides max-age and s-maxage)
        if (this.#cacheControl.noCache) {
            directives.push("no-cache");
        } else {
            // Add max-age and s-maxage only if no-cache is not set
            if (this.#cacheControl.maxAge !== null && !isNaN(this.#cacheControl.maxAge)) {
                directives.push(`max-age=${this.#cacheControl.maxAge}`);
            }
            if (this.#cacheControl.sMaxAge !== null && !isNaN(this.#cacheControl.sMaxAge)) {
                directives.push(`s-maxage=${this.#cacheControl.sMaxAge}`);
            }
        }

        // Handle must-revalidate (ignored if immutable is set)
        if (this.#cacheControl.mustRevalidate && !this.#cacheControl.immutable) {
            directives.push("must-revalidate");
        }

        // Handle immutable
        if (this.#cacheControl.immutable) {
            directives.push("immutable");
        }

        // Handle no-transform
        if (this.#cacheControl.noTransform) {
            directives.push("no-transform");
        }

        return directives.join(", ");
    }

    /**
     * Mark the response as a cache miss and store cacheKey in res.locals.
     */
    #markCacheMiss(res, cacheKey) {
        res.setHeader(httpHeaders.X_CACHE, "MISS");
        res.locals.cacheKey = cacheKey;
    }

    /**
     * Intercept the response to cache the body.
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
     * Cache the response body with a TTL.
     */
    async #cacheResponse(cacheKey, body) {
        const etag = await this.#hasherService.generateHash(body);
        await this.#cacheService.set(cacheKey, JSON.stringify({etag, body}), this.#ttl);
    }
}

const clearCache = async (key) => {
    try {
        await cacheService.delete(key);
    } catch (error) {
        console.error(`Failed to clear cache for key "${key}":`, error);
    }
}

const clearCachePattern = async (pattern) => {
    try {
        await cacheService.clearKeysByPattern(pattern);
    } catch (error) {
        console.error(`Failed to clear cache for pattern "${pattern}":`, error);
    }
}

// Create reusable cache middleware instance
const createCacheMiddleware = (options = {}) => {
    const cacheMiddleware = new CacheMiddleware(cacheService, hasherService, options);
    return cacheMiddleware.cache.bind(cacheMiddleware);
};


module.exports = {createCacheMiddleware, clearCache, clearCachePattern};
