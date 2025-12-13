import apiClient from './apiClient';

const ENDPOINTS = {
    CREATE: `/notes`,
    GET_USER_NOTES: `/notes`,
    GET_USER_NOTE_BY_ID: (noteId) => `/notes/${noteId}`,
    UPDATE_USER_NOTE_BY_ID: (noteId) => `/notes/${noteId}`,
    DELETE_USER_NOTE_BY_ID: (noteId) => `/notes/${noteId}`,
    GRANT_NOTE_PERMISSIONS: (noteId) => `/notes/${noteId}/permissions`,
    GET_NOTE_PERMISSIONS: (noteId) => `/notes/${noteId}/permissions`,
    GET_COMMIT_HISTORY: (noteId) => `/notes/${noteId}/history`,
    GET_CONTRIBUTORS: (noteId) => `/notes/${noteId}/contributors`,
    UPDATE_REACTION: (noteId) => `/notes/${noteId}/reactions`,
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
     * @param {string[]} params.tags - Tags associated with the note.
     * @param {boolean} [params.isPinned=false] - Whether the note is pinned.
     * @param {boolean} [params.isPublic=false] - Whether the note is public visibility .
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note creation fails.
     */
    async create(userId, {title, content, tags, isPinned, isPublic}, config = {}) {
        return await this.#apiClient.post(ENDPOINTS.CREATE, {
            title,
            content,
            tags,
            isPinned,
            isPublic
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
     * Update a specific note by ID with version tracking.
     * @param {Object} params - Update parameters
     * @param {string} params.noteId - The ID of the note to update
     * @param {string} [params.commitMessage] - Description of changes for version history
     * @param {Object} updateFields - Fields to update
     * @param {string} [updateFields.title] - New title for the note (optional)
     * @param {string} [updateFields.content] - New content for the note (optional)
     * @param {string[]} [updateFields.tags] - New tags for the note (optional)
     * @param {boolean} [updateFields.isPinned] - New pin status (optional)
     * @param {boolean} [updateFields.isPublic] - New visibility status (optional)
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request configuration
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note update fails.
     */
    async updateNoteById({noteId, commitMessage}, {title, content, tags, isPinned, isPublic} = {}, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.UPDATE_USER_NOTE_BY_ID(noteId),
            {title, content, tags, isPinned, isPublic, commitMessage},
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

    /**
     * Get commit history for a note with pagination
     * @param {string} noteId - The ID of the note
     * @param {Object} [queryParams={}] - Pagination and filtering options
     * @param {number} [queryParams.page=0] - Page number (0-indexed)
     * @param {number} [queryParams.limit=10] - Items per page
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with commit history data
     * @throws {Error} If fetching history fails
     */
    async getCommitHistory(noteId, queryParams = {}, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_COMMIT_HISTORY(noteId),
            {
                ...config,
                params: {...queryParams}
            }
        );
    }

    /**
     * Get contributors for a note with pagination
     * @param {string} noteId - The ID of the note
     * @param {Object} [queryParams={}] - Pagination options
     * @param {number} [queryParams.page=0] - Page number (0-indexed)
     * @param {number} [queryParams.limit=10] - Items per page
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with contributors data
     * @throws {Error} If fetching contributors fails
     */
    async getContributors(noteId, queryParams = {}, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_CONTRIBUTORS(noteId),
            {
                ...config,
                params: queryParams
            }
        );
    }

    /**
     * Create, update, or remove a reaction for a note for auth user
     * @param {string} noteId - The ID of the note
     * @param {Object} reactionData - Reaction data
     * @param {ReactionType|null} reactionData.type - The reaction type (like, love, etc.) or null to remove reaction
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with reaction operation result
     * @throws {Error} If reaction operation fails
     */
    async updateReaction(noteId, {type}, config = {}) {
        return await this.#apiClient.post(
            ENDPOINTS.UPDATE_REACTION(noteId),
            {type},
            config
        );
    }
}

/**
 * Default instance of NoteService
 * @type {NoteService}
 */
const noteService = new NoteService(apiClient)
export default noteService;
