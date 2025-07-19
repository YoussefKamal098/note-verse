import apiClient from './apiClient';
import httpHeaders from "../constants/httpHeaders";

const ENDPOINTS = {
    GET_USER: `/users/`,
    AVATAR_UPLOAD: (userId) => `/users/${userId}/avatar`,
    AVATAR_REMOVE: (userId) => `/users/${userId}/avatar`,
    UPDATE_PROFILE: (userId) => `/users/${userId}/profile`,
    GET_USER_GRANTED_PERMISSIONS: (userId) => `users/${userId}/granted-permissions`,
    REVOKE_PERMISSION: (userId) => `/users/${userId}/permissions`,
    UPDATE_PERMISSION: (userId) => `/users/${userId}/permissions`,
    GET_USER_PERMISSION: (userId) => `/users/${userId}/permissions`,
    GET_USER_COMMITS: (userId) => `/users/${userId}/commits`
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
     * Removes a user's avatar
     * @param {string} userId - ID of the user to remove avatar for
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} API response with removal result
     * @throws {Error} If removal fails
     */
    async removeAvatar(userId, config = {}) {
        return await this.#apiClient.delete(
            ENDPOINTS.AVATAR_REMOVE(userId),
            config
        );
    }

    /**
     * Updates user profile information (firstname and lastname)
     * @param {string} userId - ID of the user to update
     * @param {Object} profileData - Profile data to update
     * @param {string} profileData.firstname - New first name
     * @param {string} profileData.lastname - New last name
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Updated user profile data
     * @throws {Error} If update fails
     */
    async updateProfile(userId, {firstname, lastname}, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.UPDATE_PROFILE(userId),
            {firstname, lastname},
            config
        );
    }

    /**
     * Revoke a user's permission for a specific note
     * @param {string} userId - ID of user to revoke permission from
     * @param {Object} params
     * @param {string} params.noteId - The ID of the note
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data
     * @throws {Error} If permission revocation fails
     */
    async revokePermission(userId, {noteId}, config = {}) {
        return await this.#apiClient.delete(
            ENDPOINTS.REVOKE_PERMISSION(userId),
            {
                ...config,
                params: {noteId}
            }
        );
    }

    /**
     * Update a user's permission for a specific note
     * @param {string} userId - ID of user to update permission for
     * @param {Object} params
     * @param {string} params.noteId - The ID of the note
     * @param {string} params.role - New permission role
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data
     * @throws {Error} If permission update fails
     */
    async updatePermission(userId, {noteId, role}, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.UPDATE_PERMISSION(userId),
            {role, noteId},
            config
        );
    }

    /**
     * Get a user's permission for a specific note
     * @param {string} userId - ID of user to get permission for
     * @param {Object} params
     * @param {string} params.noteId - The ID of the note
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data
     * @throws {Error} If fetching permission fails
     */
    async getUserPermission(userId, {noteId}, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_USER_PERMISSION(userId),
            {
                ...config,
                params: {noteId}
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

    /**
     * Get commits by a specific user with optional note filtering
     * @param {string} userId - ID of the user
     * @param {Object} queryParams={} - Query parameters
     * @param {string} queryParams.noteId - Filter by specific note ID
     * @param {number} [queryParams.page=0] - Page number (0-indexed)
     * @param {number} [queryParams.limit=10] - Items per page
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with commits data
     * @throws {Error} If fetching commits fails
     */
    async getUserCommits(userId, queryParams = {}, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_USER_COMMITS(userId),
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
