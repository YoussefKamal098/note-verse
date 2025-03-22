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
     * @returns {Promise<Object>} The response object containing status code and user data.
     * @throws {Error} If the request fails or there is an error.
     */
    async getUser(userId) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER(userId));
    }

    /**
     * Uploads a user avatar using native File object metadata
     * @param {string} userId - ID of the user to upload avatar for
     * @param {File} file - Image File object to upload
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
    async uploadAvatar(userId, file) {
        const formData = new FormData();

        // Extract metadata from File object
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const mimeType = file.type || 'image/png';

        // Create formatted File with consistent naming
        const formattedFile = new File([file], `avatar.${ext}`, {
            type: mimeType
        });

        formData.append('file', formattedFile);

        return this.#apiClient.post(
            ENDPOINTS.AVATAR_UPLOAD(userId),
            formData, {
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
