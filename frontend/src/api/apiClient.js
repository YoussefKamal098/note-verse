import axios from 'axios';
import { AppConfig } from '../config';

class ApiClient {
    #api;

    constructor(baseURL) {
        this.#api = axios.create({
            baseURL,
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        });

        this.#setupInterceptors();
    }

    get instance() {
        return this.#api;
    }

    #setupInterceptors() {
        // Response interceptor for error handling
        this.#api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Process the error and return a standardized format
                const defaultMessage = 'An unexpected error occurred.';
                const statusCode = error.response?.status || 500;
                const message = error.response?.data?.message || defaultMessage;

                // Return a custom error object
                return Promise.reject({...error, statusCode, message });
            }
        );
    }
}

export default new ApiClient(AppConfig.API_BASE_URL);
