import axios from 'axios';
import {HttpStatusCode} from '../../constants/httpStatus';
import {normalizeUrl} from 'shared-utils/url.utils';
import cacheService from '../../services/cacheService';
import httpHeaders from '../../constants/httpHeaders';

/**
 * Interceptor for handling caching of GET requests and cache invalidation for DELETE/PUT requests.
 *
 * This interceptor attaches to the ApiClient instance to manage caching:
 * - For GET requests, it attempts to retrieve a cached response when offline,
 *   and uses ETag headers to conditionally request updated data when online.
 * - For non-GET requests (DELETE/PUT), it clears the related cache.
 */
class CacheInterceptor {
    /** @type {ApiClient} */
    #apiClient;

    /**
     * Creates an instance of CacheInterceptor.
     *
     * @param {ApiClient} apiClient - An instance of ApiClient to attach interceptors to.
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Attaches request and response interceptors to the API client.
     *
     * The request interceptor handles caching logic for GET requests,
     * and the response interceptor manages caching of successful GET responses
     * or cache invalidation for DELETE/PUT requests. An error interceptor is also added
     * to handle errors related to cache retrieval.
     *
     * @returns {void}
     */
    attachInterceptors() {
        this.#apiClient.addRequestInterceptor(
            this.#getRequestInterceptor.bind(this)
        );

        this.#apiClient.addResponseInterceptor(
            this.#responseInterceptor.bind(this),
            this.#errorInterceptor.bind(this)
        );
    }

    /**
     * Request interceptor to handle caching for GET requests.
     *
     * When offline, it attempts to retrieve the cached response and rejects the request
     * with the cached data. When online, it adds the "If-None-Match" header if a cached entry exists.
     *
     * @private
     * @param {import('axios').AxiosRequestConfig} config - Axios request configuration.
     * @returns {Promise<import('axios').AxiosRequestConfig>} The modified request config or a rejected promise with cached data.
     */
    async #getRequestInterceptor(config) {
        if (config.method.toLowerCase() === 'get') {
            const normalizedUrl = normalizeUrl(axios.getUri(config));
            if (!navigator.onLine) {
                try {
                    const cachedEntry = await cacheService.get(normalizedUrl);
                    if (cachedEntry && cachedEntry.etag) {
                        return Promise.reject({
                            response: {
                                data: cachedEntry.data,
                                status: HttpStatusCode.OK,
                                statusText: 'OK (from cache)',
                                headers: {},
                                config,
                                request: config,
                            },
                            __fromCache: true,
                            config,
                        });
                    }
                } catch (e) {
                    // Proceed if cache retrieval fails.
                }
            } else {
                try {
                    const cachedEntry = await cacheService.get(normalizedUrl);
                    if (cachedEntry && cachedEntry.etag) {
                        config.headers[httpHeaders.IF_NONE_MATCH] = cachedEntry.etag;
                    }
                } catch (e) {
                    // Ignore cache errors.
                }
            }
        }
        return config;
    }

    /**
     * Response interceptor to handle caching after a successful API response.
     *
     * When online, for GET requests it caches the response data,
     * and for DELETE/PUT requests it clears the related cache entry.
     *
     * @private
     * @param {import('axios').AxiosResponse} response - The Axios response object.
     * @returns {Promise<import('axios').AxiosResponse>} The original response after caching operations.
     */
    async #responseInterceptor(response) {
        if (navigator.onLine) {
            const method = response.config.method.toLowerCase();
            const normalizedUrl = normalizeUrl(axios.getUri(response.config));
            if (method === 'get') {
                await this.#handleGetCache(normalizedUrl, response);
            } else if (method === 'delete' || method === 'put') {
                await this.#handleDeleteCache(normalizedUrl);
            }
        }
        return response;
    }

    /**
     * Caches the response of a GET request.
     *
     * If the response has a valid ETag and does not indicate "no-store",
     * the cache is either saved or refreshed.
     *
     * @private
     * @param {string} normalizedUrl - The normalized URL used as the cache key.
     * @param {import('axios').AxiosResponse} response - The Axios response object.
     * @returns {Promise<void>}
     */
    async #handleGetCache(normalizedUrl, response) {
        try {
            const cacheControl = response.headers[httpHeaders.CACHE_CONTROL];
            // Do not cache if cache-control header includes "no-store"
            if (cacheControl && cacheControl.toLowerCase().includes('no-store')) {
                return;
            }
            const existingEntry = await cacheService.get(normalizedUrl);
            if (response.headers.etag) {
                if (!existingEntry || existingEntry.etag !== response.headers.etag) {
                    const cachePayload = {
                        data: response.data,
                        etag: response.headers.etag,
                    };
                    await cacheService.save(normalizedUrl, cachePayload);
                } else {
                    await cacheService.refreshEntry(normalizedUrl);
                }
            } else {
                await cacheService.save(normalizedUrl, {data: response.data});
            }
        } catch (err) {
            console.error('Error handling cache during GET response:', err);
        }
    }

    /**
     * Clears the cache for a given URL, typically after DELETE or PUT requests.
     *
     * @private
     * @param {string} normalizedUrl - The normalized URL used as the cache key.
     * @returns {Promise<void>}
     */
    async #handleDeleteCache(normalizedUrl) {
        try {
            const existingEntry = await cacheService.get(normalizedUrl);
            if (existingEntry) {
                await cacheService.delete(normalizedUrl);
            }
        } catch (err) {
            console.error('Error deleting cache for DELETE:', err);
        }
    }

    /**
     * Error interceptor to handle responses where caching provides a fallback.
     *
     * If an error is flagged as coming from the offline GET interceptor,
     * or if the error response status is 304 (Not Modified), the cached data is returned.
     * Otherwise, the error is passed to the ApiClient's error handler.
     *
     * @private
     * @param {any} error - The error object from the Axios response.
     * @returns {Promise<import('axios').AxiosResponse>} A resolved promise with cached data or the handled error.
     */
    async #errorInterceptor(error) {
        // If the error came from our offline GET interceptor, return the cached data.
        if (error && error.__fromCache) {
            return Promise.resolve({
                data: error.response.data,
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                config: error.config,
            });
        }

        // If 304 Not Modified, return cached data.
        if (error.response && error.response.status === HttpStatusCode.NOT_MODIFIED) {
            const normalizedUrl = normalizeUrl(axios.getUri(error.config));
            try {
                const cachedEntry = await cacheService.get(normalizedUrl);
                if (cachedEntry) {
                    await cacheService.refreshEntry(normalizedUrl);
                    return Promise.resolve({
                        data: cachedEntry.data,
                        status: HttpStatusCode.OK,
                        statusText: 'OK (from cache via 304)',
                        headers: error.response.headers,
                        config: error.config,
                    });
                }
            } catch (err) {
                console.error('Error retrieving cache for 304 response:', err);
            }
        }

        return this.#apiClient.handleError(error);
    }
}

export default CacheInterceptor;
