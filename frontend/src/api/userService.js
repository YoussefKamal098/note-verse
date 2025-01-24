import apiClient from './apiClient';

const ENDPOINTS = {
    GET_USER_INFO: '/users/me',
};

/**
 * A service for handling user-related API calls.
 */
class UserService {
    #apiClient;

    /**
     * Creates an instance of UserService.
     * @param {ApiClient} apiClient - The API client instance for making HTTP requests.
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Fetches the authenticated user's information from the server.
     * @returns {Promise<Object>} The response object containing status code and user data.
     * @throws {Error} If the request fails or there is an error.
     */
    async getAuthenticatedUser() {
        try {
            return await this.#apiClient.get(ENDPOINTS.GET_USER_INFO);
        } catch (error) {
            return this.#handleError(error, 'Failed to retrieve user information');
        }
    }

    /**
     * Handles errors that occur during API calls.
     * @param {Error} error - The error object returned by the failed request.
     * @param {string} defaultMessage - The default error message if the error does not provide one.
     * @throws {Error} A wrapped error with a meaningful message.
     */
    #handleError(error, defaultMessage) {
        throw new Error(error.message || defaultMessage);
    }
}

const userService = new UserService(apiClient);
export default userService;
