import apiClient from './apiClient';

const ENDPOINTS = {
    GET_USER: (userId) => `/users/${userId}`
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
     * Fetches the specified user's information from the server.
     * @param {string} userId - The ID of the user to fetch.
     * @returns {Promise<Object>} The response object containing status code and user data.
     * @throws {Error} If the request fails or there is an error.
     */
    async getUser(userId) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER(userId));
    }
}

/**
 * Default instance of UserService
 * @type {UserService}
 */
const userService = new UserService(apiClient);
export default userService;




