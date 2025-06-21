import apiClient from './apiClient';
import httpHeaders from "../constants/httpHeaders";

const ENDPOINTS = {
    GET_USER: `/users/`,
    AVATAR_UPLOAD: (userId) => `/users/${userId}/avatar`,
    GET_USER_GRANTED_PERMISSIONS: (userId) => `users/${userId}/granted-permissions`
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
     * Fetches user information from the server by either ID or email.
     * @param {Object} params - The query parameters for the request.
     * @param {string} [params.id] - The ID of the user to fetch.
     * @param {string} [params.email] - The email of the user to fetch.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} The response object containing user data.
     * @throws {Error} If the request fails or there is an error.
     */
    async getUser({id, email}, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER, {
            ...config,
            params: {
                ...(id && {id}),
                ...(email && {email})
            }
        });
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

        return this.#apiClient.patch(
            ENDPOINTS.AVATAR_UPLOAD(userId),
            formData, {
                ...config,
                headers: {
                    [httpHeaders.CONTENT_TYPE]: 'multipart/form-data'
                }
            }
        );
    }

    /**
     * Get all permissions granted by a specific user.
     * @param {string} userId - The ID of the user who granted permissions.
     * @param {Object} [queryParams={}] - Query parameters for pagination.
     * @param {number} [queryParams.page] - Page number.
     * @param {number} [queryParams.limit] - Items per page.
     * @param {number} [queryParams.limit] - Items per page.
     * @param {'note'|'file'} [queryParams.resource] - The type of resource for which permissions were granted.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching granted permissions fails.
     */
    async getPermissionsGrantedByUser(userId, queryParams = {}, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_USER_GRANTED_PERMISSIONS(userId),
            {
                ...config,
                params: {...queryParams}
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
