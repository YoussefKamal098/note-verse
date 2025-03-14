/**
 * Class for building a `Cache-Control` header with various caching directives.
 * Ensures that conflicting directives are handled properly.
 */
class CacheControlBuilder {
    constructor() {
        this.directives = {};
    }

    /**
     * Sets the resource as `private` or `public`.
     * @param {boolean} [isPrivate=true] - If true, sets `private`, otherwise `public`.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setPrivate(isPrivate = true) {
        this.directives.private = isPrivate ? 'private' : 'public';
        return this;
    }

    /**
     * Enables or disables `no-cache` directive.
     * If enabled, it removes `max-age` to prevent conflicts.
     * @param {boolean} [noCache=false] - Whether to enable `no-cache`.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setNoCache(noCache = false) {
        if (noCache) {
            this.directives['no-cache'] = 'no-cache';
            delete this.directives['max-age'];
        }
        return this;
    }

    /**
     * Enables or disables `no-store`, which overrides all other settings.
     * @param {boolean} [noStore=false] - Whether to enable `no-store`.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setNoStore(noStore = false) {
        if (noStore) {
            this.directives = {'no-store': 'no-store'};
        }
        return this;
    }

    /**
     * Enables `must-revalidate` directive.
     * @param {boolean} [mustRevalidate=false] - Whether to enable `must-revalidate`.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setMustRevalidate(mustRevalidate = false) {
        if (mustRevalidate) this.directives['must-revalidate'] = 'must-revalidate';
        return this;
    }

    /**
     * Enables `immutable` directive.
     * @param {boolean} [immutable=false] - Whether to enable `immutable`.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setImmutable(immutable = false) {
        if (immutable) this.directives.immutable = 'immutable';
        return this;
    }

    /**
     * Enables `no-transform` directive.
     * @param {boolean} [noTransform=false] - Whether to enable `no-transform`.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setNoTransform(noTransform = false) {
        if (noTransform) this.directives['no-transform'] = 'no-transform';
        return this;
    }

    /**
     * Sets the `max-age` directive if `no-cache` is not enabled.
     * @param {number|null} [maxAge=null] - Max age in seconds.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setMaxAge(maxAge = null) {
        if (maxAge !== null && !this.directives['no-cache']) {
            this.directives['max-age'] = `max-age=${maxAge}`;
        }
        return this;
    }

    /**
     * Sets the `s-maxage` directive.
     * @param {number|null} [sMaxAge=null] - Shared max age in seconds.
     * @returns {CacheControlBuilder} The builder instance.
     */
    setSMaxAge(sMaxAge = null) {
        if (sMaxAge !== null) this.directives['s-maxage'] = `s-maxage=${sMaxAge}`;
        return this;
    }

    /**
     * Builds the `Cache-Control` header value.
     * @returns {string} The formatted `Cache-Control` header value.
     */
    build() {
        return Object.values(this.directives).join(', ');
    }
}

module.exports = CacheControlBuilder;