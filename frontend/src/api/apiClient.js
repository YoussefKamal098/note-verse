import axios from 'axios';
import AppConfig from '../config';

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
    constructor({baseURL = AppConfig.API_BASE_URL, timeout = 5000} = {}) {
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
            headers: {'Content-Type': 'application/json'},
            withCredentials: true,
        });
    }

    /**
     * Sets up default response interceptors for handling errors.
     * @private
     */
    #setupInterceptors() {
        this.#api.interceptors.response.use(
            (response) => this.#handleResponse(response),
            (error) => this.#handleError(error)
        );
    }

    /**
     * Handles API responses to standardize the output.
     * @private
     * @param {Object} response - The response from the API.
     * @returns {Object} The standardized response object containing statusCode and data.
     */
    #handleResponse(response) {
        return {statusCode: response.status, data: response.data};
    }

    /**
     * Handles API request errors.
     * @private
     * @param {Object} error - The error object returned by Axios.
     * @returns {Promise<Error>} A rejected promise with the formatted error.
     */
    #handleError(error) {
        const statusCode = error.response?.status || 500;
        const backendMessage = error.response?.data?.message || "An unexpected error occurred. Please try again later.";

        this.#logError({statusCode, backendMessage, stack: error.stack});

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
        console.error("API Error:", {statusCode, backendMessage});
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

export default new ApiClient({baseURL: AppConfig.API_BASE_URL});
