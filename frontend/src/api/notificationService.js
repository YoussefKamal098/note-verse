import apiClient from './apiClient';

const ENDPOINTS = {
    GET_NOTIFICATIONS: `/notifications`,
    MARK_AS_READ: (notificationId) => `/notifications/${notificationId}/read`,
    MARK_ALL_AS_READ: `/notifications/read-all`,
    GET_UNREAD_COUNT: `/notifications/unread-count`
};

/**
 * A service for handling notification-related API calls.
 */
class NotificationService {
    #apiClient;

    /**
     * Creates an instance of NotificationService.
     * @param {ApiClient} apiClient - The API client instance for making HTTP requests.
     */
    constructor(apiClient) {
        this.#apiClient = apiClient;
    }

    /**
     * Fetches user notifications with pagination and filtering
     * @param {Object} queryParams - Query parameters
     * @param {number} [queryParams.page=0] - Page number (1-based)
     * @param {number} [queryParams.limit=10] - Items per page
     * @param {Object} [queryParams.filter] - Filter criteria
     * @param {boolean} [queryParams.filter.read] - Filter by read status
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If request fails
     */
    async getNotifications(queryParams = {}, config = {}) {
        return await this.#apiClient.get(ENDPOINTS.GET_NOTIFICATIONS, {
            ...config,
            params: {
                page: queryParams.page || 0,
                limit: queryParams.limit || 10,
                filter: queryParams.filter || {},
            }
        });
    }

    /**
     * Marks a notification as read
     * @param {string} notificationId - ID of notification to mark as read
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If request fails
     */
    async markAsRead(notificationId, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.MARK_AS_READ(notificationId),
            {}, // No body needed for this request
            config
        );
    }

    /**
     * Marks all notifications as read for the current user
     * @param {Object} [params] - Optional parameters
     * @param {Date|string} [params.before] - Mark all as read before this date
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Success status
     * @throws {Error} If request fails
     */
    async markAllAsRead(params = {}, config = {}) {
        return await this.#apiClient.patch(
            ENDPOINTS.MARK_ALL_AS_READ,
            {}, // No body needed for this request
            config
        );
    }

    /**
     * Gets the count of unread notifications for the current user
     * @param {import('axios').AxiosRequestConfig} [config={}] - Axios request config
     * @returns {Promise<Object>} Response with status code and data.
     * @throws {Error} If request fails
     */
    async getUnreadCount(config = {}) {
        return await this.#apiClient.get(
            ENDPOINTS.GET_UNREAD_COUNT,
            config
        );
    }
}

/**
 * Default instance of NotificationService
 * @type {NotificationService}
 */
const notificationService = new NotificationService(apiClient);
export default notificationService;
