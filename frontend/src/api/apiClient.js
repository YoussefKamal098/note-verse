import axios from 'axios';
import { AppConfig } from '../config';

class ApiClient {
    #api;

    constructor(baseURL, logger = console) {
        this.#api = this.#createInstance(baseURL);
        this.logger = logger;
        this.#setupInterceptors();
    }

    get instance() {
        return this.#api;
    }

    #createInstance(baseURL) {
        return axios.create({
            baseURL,
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        });
    }

    #setupInterceptors() {
        this.#api.interceptors.response.use(
            (response) => response,
            (error) => this.#handleError(error)
        );
    }

    #handleError(error) {
        const statusCode = error.response?.status || 500;
        const backendMessage = error.response?.data?.message || null;

        const userFriendlyMessage = this.#getUserFriendlyMessage(statusCode, backendMessage);

        this.#logError({ statusCode, backendMessage, userFriendlyMessage, stack: error.stack });

        return Promise.reject({
            ...error,
            message: userFriendlyMessage,
            statusCode,
        });
    }

    #getUserFriendlyMessage(statusCode, backendMessage) {
        switch (statusCode) {
            case 500:
                return "A server error occurred. Please try again later.";
            case 404:
                return "The requested resource was not found. Please check the URL or try a different search.";
            case 401:
            case 403:
                return "You are not authorized to perform this action. Please log in or check your permissions.";
            default:
                return backendMessage || "An unexpected error occurred. Please try again later.";
        }
    }

    #logError({ statusCode, backendMessage, userFriendlyMessage, stack }) {
        if (this.logger && typeof this.logger.error === "function") {
            this.logger.error("API Error:", {
                statusCode,
                backendMessage,
                userFriendlyMessage,
                stack: stack || "No stack trace available",
            });
        }
    }
}

export default new ApiClient(AppConfig.API_BASE_URL);
