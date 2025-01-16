import apiClient from './apiClient';

const ENDPOINTS = {
    CREATE: '/notes',
    GET_AUTH_USER_NOTES: '/notes/my_notes',
    GET_AUTH_USER_NOTE_BY_ID: (noteId) => `/notes/my_note/${noteId}`,
    UPDATE_AUTH_USER_NOTE_BY_ID: (noteId) => `/notes/my_note/${noteId}`,
    DELETE_AUTH_USER_NOTE_BY_ID: (noteId) => `/notes/my_note/${noteId}`,
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
     * @param {Object} params - The note details.
     * @param {string} params.title - Title of the note.
     * @param {string} params.content - Content of the note.
     * @param {string[]} [params.tags] - Tags associated with the note.
     * @param {boolean} [params.isPinned=false] - Whether the note is pinned.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note creation fails.
     */
    async create({title, content, tags, isPinned}) {
        try {
            return await this.#apiClient.post(ENDPOINTS.CREATE, {
                title,
                content,
                tags,
                isPinned,
            });
        } catch (error) {
            return this.#handleError(error, 'Note creation failed');
        }
    }

    /**
     * Get notes of the authenticated user.
     * @param {Object} [queryParams={}] - Query parameters for filtering notes.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching notes fails.
     */
    async getAuthenticatedUserNotes(queryParams = {}) {
        try {
            return await this.#apiClient.get(ENDPOINTS.GET_AUTH_USER_NOTES, {
                params: {...queryParams},
            });
        } catch (error) {
            return this.#handleError(error, 'Failed to fetch notes');
        }
    }

    /**
     * Get a specific note by ID.
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If fetching the note fails.
     */
    async getAuthenticatedUserNoteById(noteId = '') {
        try {
            return await this.#apiClient.get(ENDPOINTS.GET_AUTH_USER_NOTE_BY_ID(noteId));
        } catch (error) {
            return this.#handleError(error, 'Failed to fetch note');
        }
    }

    /**
     * Update a specific note by ID.
     * @param {string} noteId - The ID of the note.
     * @param {Object} params - The updated note details.
     * @param {string} params.title - Updated title of the note.
     * @param {string} params.content - Updated content of the note.
     * @param {string[]} [params.tags] - Updated tags for the note.
     * @param {boolean} [params.isPinned] - Updated pin status of the note.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note update fails.
     */
    async updateAuthenticatedUserNoteById(noteId = '', {title, content, tags, isPinned}) {
        try {
            return await this.#apiClient.put(
                ENDPOINTS.UPDATE_AUTH_USER_NOTE_BY_ID(noteId),
                {title, content, tags, isPinned}
            );
        } catch (error) {
            return this.#handleError(error, 'Note update failed');
        }
    }

    /**
     * Delete a specific note by ID.
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If note deletion fails.
     */
    async deleteAuthenticatedUserNoteById(noteId = '') {
        try {
            return await this.#apiClient.delete(ENDPOINTS.DELETE_AUTH_USER_NOTE_BY_ID(noteId));
        } catch (error) {
            return this.#handleError(error, 'Failed to delete note');
        }
    }

    /**
     * Handle errors and provide a meaningful message.
     * @param {Error} error - The error object.
     * @param {string} defaultMessage - The default error message.
     * @throws {Error} A wrapped error with a meaningful message.
     */
    #handleError(error, defaultMessage) {
        throw new Error(error.message || defaultMessage);
    }
}

export default new NoteService(apiClient);
