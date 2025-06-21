import apiClient from './apiClient';

const ENDPOINTS = {
    CREATE: `/notes`,
    GET_USER_NOTES: `/notes`,
    GET_USER_NOTE_BY_ID: (noteId) => `/notes/${noteId}`,
    UPDATE_USER_NOTE_BY_ID: (noteId) => `/notes/${noteId}`,
    DELETE_USER_NOTE_BY_ID: (noteId) => `/notes/${noteId}`,
    GRANT_NOTE_PERMISSIONS: (noteId) => `/notes/${noteId}/permissions`,
    REVOKE_NOTE_PERMISSION: (noteId, userId) => `/notes/${noteId}/permissions/${userId}`,
    UPDATE_NOTE_PERMISSION: (noteId, userId) => `/notes/${noteId}/permissions/${userId}`,
    GET_NOTE_USER_PERMISSION: (noteId, userId) => `/notes/${noteId}/permissions/${userId}`,
    GET_NOTE_PERMISSIONS: (noteId) => `/notes/${noteId}/permissions`
};

class NoteService {
    #apiClient;

    /**
     * Creates an instance of NoteService.
     * @param {ApiClient} apiClient - The API client instance for making HTTP requests.
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Create a new note.
     * @param {string} userId - The ID of the user.
     * @param {Object} params - The note details.
     * @param {string} params.title - Title of the note.
     * @param {string} params.content - Content of the note.
     * @param {string[]} [params.tags] - Tags associated with the note.
     * @param {boolean} [params.isPinned=false] - Whether the note is pinned.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note creation fails.
     */
    async create(userId, {title, content, tags, isPinned}, config = {}) {
        return await this.#apiClient.post(ENDPOINTS.CREATE, {
            title,
            content,
            tags,
            isPinned,
        }, config);
    }

    /**
     * Get notes of the authenticated user.
     * @param {Object} [queryParams={}] - Query parameters for filtering notes.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching notes fails.
     */
    async getUserNotes(queryParams = {}, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER_NOTES, {
            ...config,
            params: {...queryParams},
        });
    }

    /**
     * Get a specific note by ID.
     * @param {string} noteId - The ID of the note.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching the note fails.
     */
    async getNoteById(noteId, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER_NOTE_BY_ID(noteId), config);
    }

    /**
     * Update a specific note by ID.
     * @param {string} noteId - The ID of the note.
     * @param {Object} params - The updated note details.
     * @param {string} [params.title] - Updated title of the note.
     * @param {string} [params.content] - Updated content of the note.
     * @param {string[]} [params.tags] - Updated tags for the note.
     * @param {boolean} [params.isPinned] - Updated pin status of the note.
     * @param {boolean} [params.isPublic] - Updated public visibility
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note update fails.
     */
    async updateNoteById(noteId, {title, content, tags, isPinned, isPublic} = {}, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.UPDATE_USER_NOTE_BY_ID(noteId),
            {title, content, tags, isPinned, isPublic},
            config
        );
    }

    /**
     * Delete a specific note by ID.
     * @param {string} noteId - The ID of the note.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note deletion fails.
     */
    async deleteNoteById(noteId, config = {}) {
        return await this.#apiClient.delete(ENDPOINTS.DELETE_USER_NOTE_BY_ID(noteId), config);
    }

    /**
     * Grant permissions for a note to multiple users.
     * @param {string} noteId - The ID of the note.
     * @param {Object} params - Permission data.
     * @param {string[]} params.userIds - IDs of users to receive permissions.
     * @param {string} params.role - Permission role to grant.
     * @param {string} [params.message] - Optional custom message
     * @param {boolean} [params.notify=true] - Whether to send notifications
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If permission grant fails.
     */
    async grantPermissions(noteId, {userIds, role, notify, message}, config = {}) {
        return await this.#apiClient.post(
            ENDPOINTS.GRANT_NOTE_PERMISSIONS(noteId),
            {userIds, role, notify, message},
            config
        );
    }

    /**
     * Revoke permissions for a note from multiple users.
     * @param {string} noteId - The ID of the note.
     * @param {string} userId - ID of user to revoke permission from.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If permission revocation fails.
     */
    async revokePermission(noteId, userId, config = {}) {
        return await this.#apiClient.delete(
            ENDPOINTS.REVOKE_NOTE_PERMISSION(noteId, userId),
            config
        );
    }

    /**
     * Update permission for a specific user on a note.
     * @param {string} noteId - The ID of the note.
     * @param {string} userId - The ID of the user whose permission to update.
     * @param {Object} params - Permission data.
     * @param {string} params.role - New permission role.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If permission update fails.
     */
    async updatePermission(noteId, userId, {role}, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.UPDATE_NOTE_PERMISSION(noteId, userId),
            {role},
            config
        );
    }

    /**
     * Get permission for a specific user on a note.
     * @param {string} noteId - The ID of the note.
     * @param {string} userId - The ID of the user whose permission to get.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching permission fails.
     */
    async getUserPermission(noteId, userId, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_NOTE_USER_PERMISSION(noteId, userId),
            config
        );
    }

    /**
     * Get all permissions for a specific note.
     * @param {string} noteId - The ID of the note.
     * @param {Object} [queryParams={}] - Query parameters for pagination.
     * @param {number} [queryParams.page] - Page number.
     * @param {number} [queryParams.limit] - Items per page.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching permissions fails.
     */
    async getNotePermissions(noteId, queryParams = {}, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_NOTE_PERMISSIONS(noteId),
            {
                ...config,
                params: {...queryParams}
            }
        );
    }
}

/**
 * Default instance of NoteService
 * @type {NoteService}
 */
const noteService = new NoteService(apiClient)
export default noteService;
