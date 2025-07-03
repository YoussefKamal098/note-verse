import apiClient from './apiClient';

const ENDPOINTS = {
    GET_VERSION: (versionId) => `/versions/${versionId}`,
    GET_VERSION_CONTENT: (versionId) => `versions/${versionId}/content`,
    RESTORE_VERSION: (versionId) => `/versions/${versionId}/restore`,
};

class VersionService {
    #apiClient;

    /**
     * Creates an instance of VersionService.
     * @param {ApiClient} apiClient - The API client instance for making HTTP requests.
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Get version metadata
     * @param {string} versionId - The ID of the version
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and version metadata
     * @throws {Error} If fetching version fails
     */
    async getVersion(versionId, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_VERSION(versionId),
            config
        );
    }

    /**
     * Get version content
     * @param {string} versionId - The ID of the version
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and version content
     * @throws {Error} If fetching version content fails
     */
    async getVersionContent(versionId, config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_VERSION_CONTENT(versionId),
            config
        );
    }

    /**
     * Restore to a specific version
     * @param {string} versionId - The ID of the version to restore to
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data
     * @throws {Error} If version restoration fails
     */
    async restoreVersion(versionId, config = {}) {
        return await this.#apiClient.post(
            ENDPOINTS.RESTORE_VERSION(versionId),
            {},
            config
        );
    }
}

/**
 * Default instance of VersionService
 * @type {VersionService}
 */
const versionService = new VersionService(apiClient);
export default versionService;
