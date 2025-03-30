import apiClient from './apiClient';

const ENDPOINTS = {
    CREATE: (userId) => `/users/${userId}/notes`,
    GET_USER_NOTES: (userId) => `/users/${userId}/notes`,
    GET_USER_NOTE_BY_ID: (userId, noteId) => `/users/${userId}/notes/${noteId}`,
    UPDATE_USER_NOTE_BY_ID: (userId, noteId) => `/users/${userId}/notes/${noteId}`,
    DELETE_USER_NOTE_BY_ID: (userId, noteId) => `/users/${userId}/notes/${noteId}`
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
        return await this.#apiClient.post(ENDPOINTS.CREATE(userId), {
            title,
            content,
            tags,
            isPinned,
        }, config);
    }

    /**
     * Get notes of the authenticated user.
     * @param {string} userId - The ID of the user.
     * @param {Object} [queryParams={}] - Query parameters for filtering notes.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching notes fails.
     */
    async getUserNotes(userId, queryParams = {}, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER_NOTES(userId), {
            ...config,
            params: {...queryParams},
        });
    }

    /**
     * Get a specific note by ID.
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching the note fails.
     */
    async getUserNoteById(userId, noteId, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_USER_NOTE_BY_ID(userId, noteId), config);
    }

    /**
     * Update a specific note by ID.
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @param {Object} params - The updated note details.
     * @param {string} [params.title] - Updated title of the note.
     * @param {string} [params.content] - Updated content of the note.
     * @param {string[]} [params.tags] - Updated tags for the note.
     * @param {boolean} [params.isPinned] - Updated pin status of the note.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note update fails.
     */
    async updateUserNoteById(userId, noteId, {title, content, tags, isPinned} = {}, config = {}) {
        return await this.#apiClient.put(
            ENDPOINTS.UPDATE_USER_NOTE_BY_ID(userId, noteId),
            {title, content, tags, isPinned},
            config
        );
    }

    /**
     * Delete a specific note by ID.
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note deletion fails.
     */
    async deleteUserNoteById(userId, noteId, config = {}) {
        return await this.#apiClient.delete(ENDPOINTS.DELETE_USER_NOTE_BY_ID(userId, noteId), config);
    }
}

/**
 * Default instance of NoteService
 * @type {NoteService}
 */
const noteService = new NoteService(apiClient)
export default noteService;
