import apiClient from './apiClient';
import httpHeaders from "../constants/httpHeaders";

const ENDPOINTS = {
    GET_USER: (userId) => `/users/${userId}`,
    AVATAR_UPLOAD: (userId) => `/users/${userId}/avatar`
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
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} The response object containing status code and user data.
     * @throws {Error} If the request fails or there is an error.
     */
    async getUser(userId, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER(userId), config);
    }

    /**
     * Uploads a user avatar using native File object metadata
     * @param {string} userId - ID of the user to upload avatar for
     * @param {File} file - Image File object to upload
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} API response with upload result
     * @throws {Error} For invalid files or upload failures
     *
     * @example
     * // Upload avatar from file input
     * const fileInput = document.querySelector('input[type="file"]');
     * uploadAvatar('user-123', fileInput.files[0])
     *   .then(console.log)
     *   .catch(console.error);
     */
    async uploadAvatar(userId, file, config = {}) {
        const formData = new FormData();

        formData.append('file', file);

        return this.#apiClient.post(
            ENDPOINTS.AVATAR_UPLOAD(userId),
            formData, {
                ...config,
                headers: {
                    [httpHeaders.CONTENT_TYPE]: 'multipart/form-data'
                }
            }
        );
    }
}

/**
 * Default instance of UserService
 * @type {UserService}
 */
const userService = new UserService(apiClient);
export default userService;
