import axios from 'axios';
import {HttpStatusCode, HttpStatusMessages} from "../constants/httpStatus";
import httpHeaders from '../constants/httpHeaders';
import {isServerErrorStatus} from "shared-utils/http.utils";
import {time, timeUnit} from "shared-utils/date.utils"
import {normalizeUrl} from "shared-utils/url.utils"
import cacheService from "../services/cacheService"
import RoutesPaths from "../constants/RoutesPaths";
import AppConfig from '../config/config';

const AXIOS_ERROR_CODE = Object.freeze({
    ERR_NETWORK: "ERR_NETWORK",
    ECONNABORTED: "ECONNABORTED"
});

const AXIOS_ERROR_MESSAGES = Object.freeze({
    ERR_NETWORK: "Network Error - Unable to reach the server. Please check your network connection.",
    ECONNABORTED: "Connection Aborted - The connection was aborted due to timeout or server issues."
});

/**
 * A class that handles API requests using Axios.
 */
class ApiClient {
    #api;

    /**
     * Creates an instance of ApiClient.
     * @param {Object} options - Configuration options for the API client.
     * @param {string} options.baseURL - The base URL for API requests.
     * Defaults to AppConfig.API_BASE_URL.
     * @param {number} [options.timeout=5000] - Request timeout in milliseconds (default is 5000 ms).
     */
    constructor({
                    baseURL = AppConfig.API_BASE_URL,
                    timeout = time({[timeUnit.SECOND]: 5}, timeUnit.MILLISECOND)
                } = {}) {
        this.#api = this.#createInstance(baseURL, timeout);
        this.#setupInterceptors();
    }

    /**
     * Getter for the Axios instance.
     * @returns {AxiosInstance} The Axios instance used for API requests.
     */
    get instance() {
        return this.#api;
    }

    /**
     * Creates an Axios instance.
     * @private
     * @param {string} baseURL - The base URL for API requests.
     * @param {number} timeout - Request timeout in milliseconds.
     * @returns {AxiosInstance} A configured Axios instance.
     */
    #createInstance(baseURL, timeout) {
        return axios.create({
            baseURL,
            timeout,
            headers: {[httpHeaders.CONTENT_TYPE]: 'application/json'},
            withCredentials: true,
        });
    }

    /**
     * Sets up default response interceptors for handling errors.
     * @private
     */
    #setupInterceptors() {
        // Request interceptor for GET requests (handles ETag header and offline caching)
        this.#api.interceptors.request.use(this.#getRequestInterceptor.bind(this));

        // Response interceptor for caching and error handling.
        this.#api.interceptors.response.use(
            this.#responseInterceptor.bind(this),
            this.#errorInterceptor.bind(this)
        );
    }

    /**
     * Interceptor for GET requests.
     * If online and a cached ETag exists, adds the "If-None-Match" header.
     * If offline, attempts to serve a cached response.
     * @private
     * @param {Object} config - The Axios request configuration.
     * @returns {Promise<Object>} The (possibly modified) config or a rejected promise with cached data.
     */
    async #getRequestInterceptor(config) {
        if (config.method.toLowerCase() === 'get') {
            const normalizedUrl = normalizeUrl(axios.getUri(config));

            if (!navigator.onLine) {
                try {
                    const cachedEntry = await cacheService.get(normalizedUrl);
                    if (cachedEntry && cachedEntry.etag) {
                        // Reject with a synthetic error object that mimics a real Axios error.
                        return Promise.reject({
                            response: {
                                data: cachedEntry.data,
                                status: HttpStatusCode.OK,
                                statusText: 'OK (from cache)',
                                headers: {},
                                config,
                                request: config, // or originalRequest: config, if needed
                            },
                            __fromCache: true,
                            config,
                        });
                    }
                } catch (e) {
                    // If cache retrieval fails, continue.
                }
            } else {
                try {
                    const cachedEntry = await cacheService.get(normalizedUrl);
                    if (cachedEntry && cachedEntry.etag) {
                        config.headers[httpHeaders.IF_NONE_MATCH] = cachedEntry.etag;
                    }
                } catch (e) {
                    // No cached entry, proceed without header.
                }
            }
        }

        return config;
    }

    /**
     * Interceptor for GET responses.
     * Caches the response data along with the ETag header (if present).
     * @private
     * @param {Object} response - The Axios response object.
     * @returns {Object} The original response.
     */
    async #responseInterceptor(response) {
        if (navigator.onLine) {
            const method = response.config.method.toLowerCase();
            const normalizedUrl = normalizeUrl(axios.getUri(response.config));

            if (method === 'get') {
                await this.#handleGetCache(normalizedUrl, response);
            } else if (method === 'put') {
                await this.#handlePutCache(normalizedUrl, response);
            } else if (method === 'delete') {
                await this.#handleDeleteCache(normalizedUrl);
            }
        }
        return response;
    }

    /**
     * Handles cache update for GET responses.
     * Saves new payload if ETag changes; otherwise, refreshes the entry.
     */
    async #handleGetCache(normalizedUrl, response) {
        try {
            const existingEntry = await cacheService.get(normalizedUrl);
            if (response.headers.etag) {
                if (!existingEntry || existingEntry.etag !== response.headers.etag) {
                    const cachePayload = {
                        data: response.data,
                        etag: response.headers.etag
                    };
                    await cacheService.save(normalizedUrl, cachePayload);
                } else {
                    await cacheService.refreshEntry(normalizedUrl);
                }
            } else {
                // No ETag: save new payload by default.
                await cacheService.save(normalizedUrl, {data: response.data});
            }
        } catch (err) {
            console.error('Error handling cache during GET response:', err);
        }
    }

    /**
     * Handles cache update for PUT responses.
     * If a cache entry exists, update it with the new response data.
     */
    async #handlePutCache(normalizedUrl, response) {
        try {
            const existingEntry = await cacheService.get(normalizedUrl);
            if (existingEntry) {
                const cachePayload = {data: response.data};
                if (response.headers.etag) {
                    cachePayload.etag = response.headers.etag;
                }
                await cacheService.save(normalizedUrl, cachePayload);
            }
        } catch (err) {
            console.error('Error updating cache after PUT:', err);
        }
    }

    /**
     * Handles cache update for DELETE responses.
     * If a cache entry exists, delete it.
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
     * Interceptor for response errors.
     * - If error comes from offline GET request with cached data, returns that data.
     * - If a 304 Not Modified response is received, returns the cached response.
     * - For non-GET requests when offline, returns a fallback 503 response.
     * @private
     * @param {Object} error - The error object from Axios.
     * @returns {Promise<Object>} A resolved promise with fallback/cached response, or a rejected promise.
     */
    async #errorInterceptor(error) {
        // If the error came from our offline GET interceptor, return the cached data.
        if (error && error.__fromCache) {
            return Promise.resolve({
                data: error.response.data,
                statusCode: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                config: error.config,
            });
        }

        // If 304 Not Modified, return cached data.
        if (error.response && error.response.status === HttpStatusCode.NOT_MODIFIED) {
            const fullUrl = normalizeUrl(axios.getUri(error.config));
            try {
                const cachedEntry = await cacheService.get(fullUrl);
                if (cachedEntry) {
                    return Promise.resolve({
                        data: cachedEntry.data,
                        statusCode: HttpStatusCode.OK,
                        statusText: 'OK (from cache via 304)',
                        headers: error.response.headers,
                        config: error.config,
                    });
                }
            } catch (err) {
                console.error('Error retrieving cache for 304 response:', err);
            }
        }

        return this.#handleError(error);
    }

    /**
     * Handles API responses to standardize the output.
     *
     * This method transforms the raw Axios response into a uniform format containing:
     * - statusCode: The HTTP status code from the API.
     * - data: The payload returned by the API.
     * - headers: The response headers.
     * - config: The original Axios request configuration.
     * - message: A human-readable message derived from the API response or HTTP status.
     *
     * This standardized response format provides additional context useful for debugging,
     * response handling, and further processing.
     *
     * @private
     * @param {Object} response - The Axios response object.
     * @returns {Object} A standardized response object containing:
     *   - {number} statusCode - The HTTP status code.
     *   - {*} data - The response data.
     *   - {Object} headers - The HTTP response headers.
     *   - {Object} config - The Axios request configuration.
     *   - {string} message - A message from the response or a default based on the status code.
     */
    #handleResponse(response) {
        const message = response.data?.message ||
            HttpStatusMessages[response.status] ||
            "Request completed successfully";

        return {
            message,
            statusCode: response.status,
            data: response.data,
            headers: response.headers,
            config: response.config,
        };
    }

    /**
     * Handles API request errors.
     * @private
     * @param {Object} error - The error object returned by Axios.
     * @returns {Promise<Error>|void} A rejected promise with the standardized error object if no critical error
     * is detected; otherwise, it redirects the user and returns nothing.
     */
    #handleError(error) {
        const statusCode = error.response?.status || AXIOS_ERROR_CODE[error.code] || HttpStatusCode.SERVICE_UNAVAILABLE;
        const backendMessage = error.response?.data?.message || HttpStatusMessages[statusCode] || AXIOS_ERROR_MESSAGES[error.code] || "An unexpected error occurred. Please try again later.";
        this.#logError({statusCode, backendMessage, stack: error.stack});

        // In the future, this will be a dedicated error page to handle all kinds of errors
        if (isServerErrorStatus(statusCode) || AXIOS_ERROR_CODE[statusCode]) {
            window.location = RoutesPaths.ERROR;
        }

        return Promise.reject({
            ...error,
            message: backendMessage,
            statusCode,
        });
    }

    /**
     * Logs error details to the console or a logger.
     * @private
     * @param {Object} errorDetails - Details of the error to log.
     * @param {number} errorDetails.statusCode - The HTTP status code of the error.
     * @param {string} errorDetails.backendMessage - The error message returned by the server.
     * @param {string} [errorDetails.stack] - The stack trace of the error (optional).
     */
    #logError({statusCode, backendMessage, stack}) {
        console.error("API Error:", {
            statusCode,
            backendMessage,
            // stack: stack || "No stack trace available"
        });
    }

    /**
     * Adds a custom response interceptor.
     * @param {function} onFulfilled - Function to handle successful responses.
     * @param {function} onRejected - Function to handle errors in responses.
     */
    addResponseInterceptor(onFulfilled, onRejected) {
        this.#api.interceptors.response.use(onFulfilled, onRejected);
    }

    /**
     * Adds a custom request interceptor.
     * @param {function} onFulfilled - Function to handle requests before sending them.
     * @param {function} onRejected - Function to handle request errors.
     */
    addRequestInterceptor(onFulfilled, onRejected) {
        this.#api.interceptors.request.use(onFulfilled, onRejected);
    }

    /**
     * Sends a GET request.
     * @param {string} url - The endpoint URL.
     * @param {Object} [config] - Optional Axios request configuration.
     * @returns {Promise<Object>} The response from the API.
     */
    async get(url, config = {}) {
        return this.#api.get(url, config).then(this.#handleResponse);
    }

    /**
     * Sends a POST request.
     * @param {string} url - The endpoint URL.
     * @param {Object} data - The payload for the request.
     * @param {Object} [config] - Optional Axios request configuration.
     * @returns {Promise<Object>} The response from the API.
     */
    async post(url, data, config = {}) {
        return this.#api.post(url, data, config).then(this.#handleResponse);
    }

    /**
     * Sends a PUT request.
     * @param {string} url - The endpoint URL.
     * @param {Object} data - The payload for the request.
     * @param {Object} [config] - Optional Axios request configuration.
     * @returns {Promise<Object>} The response from the API.
     */
    async put(url, data, config = {}) {
        return this.#api.put(url, data, config).then(this.#handleResponse);
    }

    /**
     * Sends a DELETE request.
     * @param {string} url - The endpoint URL.
     * @param {Object} [config] - Optional Axios request configuration.
     * @returns {Promise<Object>} The response from the API.
     */
    async delete(url, config = {}) {
        return this.#api.delete(url, config).then(this.#handleResponse);
    }
}

const apiClient = new ApiClient({baseURL: AppConfig.API_BASE_URL});
export default apiClient;
