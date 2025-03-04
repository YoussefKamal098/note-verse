import {HttpStatusCode} from '../../constants/httpStatus';
import httpHeaders from '../../constants/httpHeaders';
import errorCode from '../../constants/errorCodes';

const ENDPOINTS = {
    CSRF_ENDPOINT: '/csrf-tokens',
};

/**
 * Interceptor for handling CSRF tokens in API requests.
 *
 * This interceptor attaches to the ApiClient instance to automatically inject a CSRF token
 * into requests that require it and to handle CSRF-related errors in responses.
 */
class CsrfInterceptor {
    /** @type {string|null} */
    #csrfToken = null;
    /** @type {boolean} */
    #isRefreshingToken = false;
    /** @type {Array<Function>} */
    #pendingRequests = [];
    /** @type {ApiClient} */
    #apiClient;

    /**
     * Creates an instance of CsrfInterceptor.
     *
     * @param {ApiClient} apiClient - An instance of ApiClient to attach interceptors to.
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Attaches CSRF-related interceptors to the API client.
     *
     * This method sets up a request interceptor to add the CSRF token when needed and a response
     * interceptor to handle CSRF errors.
     *
     * @returns {void}
     */
    attachInterceptors() {
        // Attach request interceptor to inject CSRF token.
        this.#apiClient.addRequestInterceptor(
            this.#handleCsrfRequest.bind(this)
        );

        // Attach response interceptor to catch CSRF-related errors.
        this.#apiClient.addResponseInterceptor(
            (response) => response,
            this.#csrfErrorInterceptor.bind(this)
        );
    }

    /**
     * Request interceptor to add CSRF token to the request headers when required.
     *
     * @private
     * @param {import('axios').AxiosRequestConfig} config - Axios request configuration.
     * @returns {Promise<import('axios').AxiosRequestConfig>} Modified request config with CSRF token if applicable.
     */
    async #handleCsrfRequest(config) {
        if (this.#requiresCsrfToken(config.method)) {
            await this.#ensureValidCsrfToken();
            config.headers[httpHeaders.X_CSRF_TOKEN] = this.#csrfToken;
        }
        return config;
    }

    /**
     * Determines if a CSRF token is required based on the HTTP method.
     *
     * @private
     * @param {string} method - The HTTP method of the request.
     * @returns {boolean} True if the method requires a CSRF token; otherwise, false.
     */
    #requiresCsrfToken(method) {
        const safeMethods = new Set(['get', 'head', 'options']);
        return !safeMethods.has(method.toLowerCase());
    }

    /**
     * Ensures a valid CSRF token is available.
     *
     * If no token exists and a token is not currently being refreshed, it initiates acquisition.
     * If a token refresh is in progress, it returns a promise that resolves when the token is ready.
     *
     * @private
     * @returns {Promise<string|undefined>} The CSRF token or undefined if already valid.
     */
    async #ensureValidCsrfToken() {
        if (!this.#csrfToken && !this.#isRefreshingToken) {
            return this.#acquireCsrfToken();
        }
        if (this.#isRefreshingToken) {
            return new Promise((resolve) => {
                this.#pendingRequests.push(resolve);
            });
        }
    }

    /**
     * Acquires a new CSRF token from the server.
     *
     * Uses the ApiClient's GET method to fetch the token and update internal state accordingly.
     *
     * @private
     * @returns {Promise<string>} The newly acquired CSRF token.
     */
    async #acquireCsrfToken() {
        try {
            this.#isRefreshingToken = true;
            // Use the public get method in ApiClient to fetch the CSRF token.
            const response = await this.#apiClient.get(ENDPOINTS.CSRF_ENDPOINT);
            this.#csrfToken = response.data.csrfToken;
            this.#processPendingRequests();
            return this.#csrfToken;
        } catch (error) {
            const err = new Error('CSRF token acquisition failed');
            err.cause = this.#wrapCsrfError(error);
            return this.#apiClient.handleError(err);
        } finally {
            this.#isRefreshingToken = false;
        }
    }

    /**
     * Processes all pending requests waiting for a CSRF token refresh.
     *
     * @private
     * @returns {void}
     */
    #processPendingRequests() {
        this.#pendingRequests.forEach((resolve) => resolve());
        this.#pendingRequests = [];
    }

    /**
     * Wraps an error object with additional CSRF error details.
     *
     * @private
     * @param {any} error - The original error object.
     * @returns {Object} A new error object augmented with CSRF error codes and flags.
     */
    #wrapCsrfError(error) {
        return {
            ...error,
            code: error.response?.status === HttpStatusCode.FORBIDDEN
                ? errorCode.CSRF_INVALID
                : errorCode.CSRF_GENERATION_FAILED,
            isCsrfError: true,
        };
    }

    /**
     * Checks if the error is related to CSRF token validation.
     *
     * @private
     * @param {any} error - The error object from a failed request.
     * @returns {boolean} True if the error is a CSRF-related error; otherwise, false.
     */
    #isCsrfRelatedError(error) {
        return (
            error.config &&
            error.response?.status === HttpStatusCode.FORBIDDEN &&
            error.response?.data?.code === errorCode.CSRF_INVALID
        );
    }

    /**
     * Response interceptor for handling CSRF-related errors.
     *
     * @private
     * @param {any} error - The error object from the Axios response.
     * @returns {Promise<any>} A promise resolving to a retried request or rejected error handling.
     */
    async #csrfErrorInterceptor(error) {
        if (this.#isCsrfRelatedError(error)) {
            return this.#handleCsrfError(error);
        }
        return this.#apiClient.handleError(error);
    }

    /**
     * Handles a CSRF-related error by attempting to acquire a new token and retry the failed request.
     *
     * @private
     * @param {any} error - The original error object containing CSRF error details.
     * @returns {Promise<any>} A promise that resolves with the retried request or rejects with an error.
     */
    async #handleCsrfError(error) {
        if (!this.#isRefreshingToken) {
            this.#csrfToken = null;
            try {
                await this.#acquireCsrfToken();
                return this.#retryRequest(error.config);
            } catch (e) {
                return this.#apiClient.handleError(this.#rejectWithCsrfError(error));
            }
        }
        return new Promise((resolve) => {
            this.#pendingRequests.push(() => resolve(this.#retryRequest(error.config)));
        });
    }

    /**
     * Retries the original request with the new CSRF token injected.
     *
     * @private
     * @param {import('axios').AxiosRequestConfig} config - The original Axios request configuration.
     * @returns {Promise<import('axios').AxiosResponse>} The Axios response from the retried request.
     */
    async #retryRequest(config) {
        config.headers[httpHeaders.X_CSRF_TOKEN] = this.#csrfToken;
        return this.#apiClient.request(config);
    }

    /**
     * Constructs a new error object indicating CSRF validation failure.
     *
     * @private
     * @param {any} error - The original error object.
     * @returns {Object} The new error object with CSRF-specific error information.
     */
    #rejectWithCsrfError(error) {
        return {
            ...error,
            code: errorCode.CSRF_INVALID,
            message: 'CSRF validation failed',
            isCsrfError: true,
        };
    }
}

export default CsrfInterceptor;
