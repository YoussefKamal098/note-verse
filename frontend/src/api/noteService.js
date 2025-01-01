import apiClient from './apiClient';

const ENDPOINTS = {
    CREATE: '/notes',
    GET_ALL: '/notes/all',
    TEXT_SEARCH: '/notes/textSearch',
    GET_BY_ID: (noteId) => `/notes/${noteId}`,
    UPDATE: (noteId) => `/notes/${noteId}`,
    DELETE: (noteId) => `/notes/${noteId}`,
};

class NoteService {
    #apiClient;

    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    async create({ title, content, tags, isPinned }) {
        try {
            const response = await this.#apiClient.instance.post(ENDPOINTS.CREATE, { title, content, tags, isPinned });
            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Note creation failed');
        }
    }

    async getAll(queryParams = {}) {
        try {
            const response = await this.#apiClient.instance.get(ENDPOINTS.GET_ALL, { params: queryParams });
            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Failed to fetch notes');
        }
    }

    async textSearch(searchText = "", queryParams = {}) {
        try {
            const response = await this.#apiClient.instance.get(ENDPOINTS.TEXT_SEARCH, { params: { searchText, ...queryParams } });
            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Search failed');
        }
    }

    async getById(noteId = "") {
        try {
            const response = await this.#apiClient.instance.get(ENDPOINTS.GET_BY_ID(noteId));
            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Failed to fetch note');
        }
    }

    async update(noteId = "", { title, content, tags, isPinned }) {
        try {
            const response = await this.#apiClient.instance.put(ENDPOINTS.UPDATE(noteId), { title, content, tags, isPinned });
            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Note update failed');
        }
    }

    async delete(noteId = "") {
        try {
            const response = await this.#apiClient.instance.delete(ENDPOINTS.DELETE(noteId));
            return { statusCode: response.status, data: response.data };
        } catch (error) {
            return this.#handleError(error, 'Failed to delete note');
        }
    }

    #handleError(error, defaultMessage) {
        throw new Error(error.message || defaultMessage);
    }
}

export default new NoteService(apiClient);
