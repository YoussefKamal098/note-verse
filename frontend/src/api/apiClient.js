import axios from 'axios';
import {HttpStatusMessages} from '../constants/httpStatus';
import httpHeaders from '../constants/httpHeaders';
import {isServerErrorStatus} from 'shared-utils/http.utils';
import {time, timeUnit} from 'shared-utils/date.utils';
import AppConfig from '../config/config';
import routesPaths from '../constants/routesPaths';
import CacheInterceptor from './interceptors/cacheInterceptor';
import CsrfInterceptor from './interceptors/csrfInterceptor';

const AXIOS_ERROR_CODES = Object.freeze({
    ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
    ERR_BAD_RESPONSE: "ERR_BAD_RESPONSE",
    ERR_NETWORK: "ERR_NETWORK",
    ERR_TIMEOUT: "ERR_TIMEOUT",
    ERR_CANCELED: "ERR_CANCELED",
    ECONNABORTED: "ECONNABORTED"
});

const AXIOS_ERROR_MESSAGES = Object.freeze({
    [AXIOS_ERROR_CODES.ERR_BAD_REQUEST]: "Bad Request",
    [AXIOS_ERROR_CODES.ERR_BAD_RESPONSE]: "Bad Response",
    [AXIOS_ERROR_CODES.ERR_NETWORK]: "Network Error",
    [AXIOS_ERROR_CODES.ERR_TIMEOUT]: "Request timed out",
    [AXIOS_ERROR_CODES.ERR_CANCELED]: "Request was aborted",
    [AXIOS_ERROR_CODES.ECONNABORTED]: "Connection aborted",
});

/**
 * API client class for handling HTTP requests with Axios.
 */
class ApiClient {
    /** @type {import('axios').AxiosInstance} */
    #api;

    /**
     * Creates an instance of ApiClient.
     * @param {Object} [options={}] - Configuration options.
     * @param {string} [options.baseURL=AppConfig.API_BASE_URL] - The base URL for API requests.
     * @param {number} [options.timeout=time({[timeUnit.SECOND]: 15}, timeUnit.MILLISECOND)] - Request timeout in milliseconds.
     */
    constructor({
                    baseURL = AppConfig.API_BASE_URL,
                    timeout = time({[timeUnit.SECOND]: 15}, timeUnit.MILLISECOND)
                } = {}) {
        this.#api = axios.create({
            baseURL,
            timeout,
            headers: {[httpHeaders.CONTENT_TYPE]: 'application/json'},
            withCredentials: true,
        });

        this.#setupInterceptors();
    }

    /**
     * Sets up request and response interceptors.
     * @private
     */
    #setupInterceptors() {
        new CsrfInterceptor(this).attachInterceptors();
        new CacheInterceptor(this).attachInterceptors();

        this.addResponseInterceptor(this.#handleResponse.bind(this));
    }

    /**
     * Handles API response formatting.
     * @private
     * @param {import('axios').AxiosResponse} response - The Axios response object.
     * @returns {Object} Formatted response.
     */
    #handleResponse(response) {
        const message = response.data?.message ||
            response.statusText ||
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
     * Sends an HTTP request.
     * @param {import('axios').AxiosRequestConfig} config - Axios request configuration.
     * @returns {Promise<import('axios').AxiosResponse>} Axios response promise.
     */
    request(config) {
        return this.#api.request(config);
    }

    /**
     * Adds a request interceptor.
     * @param {Function} onFulfilled - Function to handle the request before sending.
     * @param {Function} [onRejected] - Function to handle errors.
     */
    addRequestInterceptor(onFulfilled, onRejected) {
        this.#api.interceptors.request.use(onFulfilled, onRejected);
    }

    /**
     * Adds a response interceptor.
     * @param {Function} onFulfilled - Function to handle successful responses.
     * @param {Function} [onRejected] - Function to handle errors.
     */
    addResponseInterceptor(onFulfilled, onRejected) {
        this.#api.interceptors.response.use(onFulfilled, onRejected);
    }

    /**
     * Handles API errors.
     * @param {import('axios').AxiosError} error - The Axios error object.
     * @returns {Promise<never>} A rejected promise with an error object.
     */
    handleError(error) {
        const status = error.response?.status || AXIOS_ERROR_CODES[error.code]
        const message = error.response?.data?.message || HttpStatusMessages[status] ||
            AXIOS_ERROR_MESSAGES[error.code] || "An unexpected error occurred. Please try again later.";

        console.error("API Error:", {message, status});

        if (isServerErrorStatus(status)) {
            window.location = routesPaths.ERROR;
        }

        return Promise.reject({...error, message});
    }

    /**
     * Sends a GET request.
     * @param {string} url - The request URL.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Optional Axios request config.
     * @returns {Promise<import('axios').AxiosResponse>} Axios response promise.
     */
    async get(url, config = {}) {
        return this.#api.get(url, config);
    }

    /**
     * Sends a POST request.
     * @param {string} url - The request URL.
     * @param {any} data - The request payload.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Optional Axios request config.
     * @returns {Promise<import('axios').AxiosResponse>} Axios response promise.
     */
    async post(url, data, config = {}) {
        return this.#api.post(url, data, config);
    }

    /**
     * Sends a PUT request.
     * @param {string} url - The request URL.
     * @param {any} data - The request payload.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Optional Axios request config.
     * @returns {Promise<import('axios').AxiosResponse>} Axios response promise.
     */
    async put(url, data, config = {}) {
        return this.#api.put(url, data, config);
    }

    /**
     * Sends a PATCH request.
     * @param {string} url - The request URL.
     * @param {any} data - The request payload.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Optional Axios request config.
     * @returns {Promise<import('axios').AxiosResponse>} Axios response promise.
     */
    async patch(url, data, config = {}) {
        return this.#api.patch(url, data, config);
    }

    /**
     * Sends a DELETE request.
     * @param {string} url - The request URL.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Optional Axios request config.
     * @returns {Promise<import('axios').AxiosResponse>} Axios response promise.
     */
    async delete(url, config = {}) {
        return this.#api.delete(url, config);
    }
}

/**
 * Default instance of ApiClient.
 * @type {ApiClient}
 */
const apiClient = new ApiClient({baseURL: AppConfig.API_BASE_URL});
export {AXIOS_ERROR_MESSAGES as API_CLIENT_ERROR_MESSAGES, AXIOS_ERROR_CODES as API_CLIENT_ERROR_CODES};
export default apiClient;
