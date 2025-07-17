const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const {deepFreeze} = require("shared-utils/obj.utils");
const NotificationProcessorFactory = require("./processors/notificationProcessorFactory");

/**
 * @class NotificationService
 * @description Service for managing notifications with transaction support
 */
class NotificationService {
    /**
     * Maximum retries for batch operations
     * @type {number}
     */
    static #MAX_RETRIES = 3;
    /**
     * @private
     * @type {NotificationRepository}
     */
    #notificationRepo;
    /**
     * @private
     * @type {NotificationEmitter}
     */
    #notificationEmitter;
    /**
     * @private
     * @type {OnlineUserService}
     */
    #onlineUserService;
    /**
     * @private
     * @type {NotificationCache}
     */
    #notificationCache
    /**
     * @private
     * @type {NotificationProcessorFactory}
     */
    #processorFactory;

    /**
     * @constructor
     * @param {Object} dependencies
     * @param {NotificationRepository} dependencies.notificationRepo
     * @param {NotificationEmitter} dependencies.notificationEmitter
     * @param {OnlineUserService} dependencies.onlineUserService
     * @param {NotificationCache} dependencies.notificationCache
     * @param {ResourceUserCombiner} dependencies.resourceUserCombiner
     * @param {ResourceNoteCombiner} dependencies.resourceNoteCombiner
     * @param {ResourceVersionCombiner} dependencies.resourceVersionCombiner
     * @param {ResourceSessionCombiner} dependencies.resourceSessionCombiner
     */
    constructor({
                    notificationRepo,
                    notificationEmitter,
                    onlineUserService,
                    notificationCache,
                    resourceUserCombiner,
                    resourceNoteCombiner,
                    resourceVersionCombiner,
                    resourceSessionCombiner
                }) {
        this.#notificationRepo = notificationRepo;
        this.#notificationEmitter = notificationEmitter;
        this.#onlineUserService = onlineUserService;
        this.#notificationCache = notificationCache;
        this.#processorFactory = new NotificationProcessorFactory({
            noteCombiner: resourceNoteCombiner,
            versionCombiner: resourceVersionCombiner,
            userCombiner: resourceUserCombiner,
            sessionCombiner: resourceSessionCombiner,
        });
    }

    /**
     * @private
     * Processes notification payload using appropriate processor
     * @param {NotificationOutput} notification
     * @returns {Promise<EnhancedNotificationOutput | null>} Processed payload
     */
    async #processNotificationPayload(notification) {
        if (!notification.payload) return null;
        const processor = this.#processorFactory.getProcessor(notification.type);
        return processor ? await processor.process(notification.payload) : null;
    }

    /**
     * @private
     * Enhances notification with combined resources
     * @param {NotificationOutput} notification
     * @returns {Promise<Readonly<EnhancedNotificationOutput>>}
     */
    async #enhanceNotification(notification) {
        const enhancedPayload = await this.#processNotificationPayload(notification);
        return deepFreeze({
            ...notification,
            payload: enhancedPayload || notification.payload
        });
    }

    /**
     * @private
     * Updates cache for notification recipients
     * @param {Array<NotificationOutput>} notifications
     * @returns {Promise<void>}
     */
    async #updateRecipientCaches(notifications) {
        const recipients = new Set(notifications.map(n => n.recipient));
        for (const recipient of recipients) {
            await this.#notificationCache.clear(recipient);
            const unreadCount = notifications.filter(
                n => n.recipient === recipient && !n.read
            ).length;
            if (unreadCount > 0) {
                await this.#notificationCache.incrementUnreadCount(recipient, unreadCount);
            }
        }
    }

    /**
     * @private
     * Handles batch creation retry logic
     * @param {Array<NotificationInput>} notifications
     * @param {Object} session
     * @returns {Promise<Readonly<Array<Readonly<NotificationOutput>>>>}
     */
    async #attemptBatchCreateWithRetry(notifications, session) {
        let attempts = 0;
        let lastError = null;

        while (attempts < NotificationService.#MAX_RETRIES) {
            try {
                return await this.#notificationRepo.batchCreate(notifications, {session});
            } catch (err) {
                lastError = err;
                attempts++;
                await new Promise(res => setTimeout(res, 500 * attempts));
            }
        }

        throw lastError || new Error(statusMessages.NOTIFICATIONS_CREATION_FAILED);
    }

    /**
     * Creates multiple notifications in a batch
     * @param {Array<NotificationInput>} notifications
     * @returns {Promise<Readonly<Array<Readonly<EnhancedNotificationOutput>>>>}
     */
    async batchCreate(notifications) {
        return this.#notificationRepo.executeTransaction(async (session) => {
            const insertedNotifications = await this.#attemptBatchCreateWithRetry(notifications, session);
            await this.#updateRecipientCaches(insertedNotifications);

            const enhanced = await Promise.all(insertedNotifications.map(n => this.#enhanceNotification(n)));
            await this.#notificationEmitter.emitBatch(enhanced);

            return deepFreeze(enhanced);
        }, {
            message: statusMessages.NOTIFICATIONS_CREATION_FAILED,
            conflictMessage: statusMessages.NOTIFICATION_CONFLICT
        });
    }

    /**
     * @private
     * Handles single notification creation
     * @param {NotificationInput} data
     * @param {Object} session
     * @returns {Promise<Readonly<EnhancedNotificationOutput>>}
     */
    async #createSingleNotification(data, session) {
        const result = await this.#notificationRepo.create(data, {session});
        await this.#notificationCache.clear(data.recipient);
        await this.#notificationCache.incrementUnreadCount(data.recipient);

        const enhanced = await this.#enhanceNotification(result);
        if (await this.#onlineUserService.isOnline(data.recipient)) {
            await this.#notificationEmitter.emitToUser(data.recipient, enhanced);
        }

        return enhanced;
    }

    /**
     * Creates a single notification
     * @param {NotificationInput} data
     * @returns {Promise<Readonly<EnhancedNotificationOutput>>}
     */
    async create(data) {
        return this.#notificationRepo.executeTransaction(
            (session) => this.#createSingleNotification(data, session),
            {message: statusMessages.NOTIFICATION_CREATION_FAILED}
        );
    }

    /**
     * @private
     * Retrieves notifications from cache or falls back to database
     * @param {string} userId
     * @param {Object} options
     * @returns {Promise<Array<EnhancedNotificationOutput>>}
     */
    async #retrieveNotifications(userId, options) {
        const cached = await this.#notificationCache.get(
            userId,
            options.page,
            options.limit,
            options.filter,
            options.projection
        );
        if (cached) return cached;

        const notifications = await this.#notificationRepo.getUserNotifications(
            {userId},
            options
        );

        return Promise.all(
            notifications.map(n => this.#enhanceNotification(n))
        );
    }

    /**
     * Gets notifications for a specific user with pagination
     * @param {Object} params
     * @param {string} params.userId - ID of the user to get notifications for
     * @param {Object} [options] - Options
     * @param {number} [options.page=0] - Page number (0-based)
     * @param {number} [options.limit=10] - Results per page
     * @param {Object} [options.filter] - Filter criteria
     * @param {boolean} [options.filter.read] - Filter by read status (true/false)
     * @param {Object|string} [options.projection] - Fields to include/exclude
     * @returns {Promise<Readonly<Array<Readonly<EnhancedNotificationOutput>>>>} Array of notification documents (empty if none found)
     * @throws {AppError} When retrieval fails
     */
    async getUserNotifications({userId}, {page = 0, limit = 10, filter = {}, projection = null} = {}) {
        try {
            const enhancedNotifications = await this.#retrieveNotifications(
                userId,
                {page, limit, filter, projection}
            );

            // Cache the result
            await this.#notificationCache.set(userId, enhancedNotifications, page, limit, filter, projection);

            return deepFreeze(enhancedNotifications);
        } catch (err) {
            throw new AppError(
                statusMessages.NOTIFICATION_RETRIEVAL_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * @private
     * Updates notification read status
     * @param {string} notificationId
     * @param {Object} session
     * @returns {Promise<NotificationOutput|null>}
     */
    async #updateNotificationReadStatus(notificationId, session) {
        const result = await this.#notificationRepo.markAsRead(
            {notificationId},
            {session}
        );

        if (result) {
            await this.#notificationCache.clear(result.recipient);
            await this.#notificationCache.decrementUnreadCount(result.recipient);
        }

        return result;
    }

    /**
     * Marks a notification as read
     * @param {Object} params
     * @param {string} params.notificationId
     * @returns {Promise<Readonly<NotificationOutput|null>>}
     */
    async markAsRead({notificationId}) {
        return this.#notificationRepo.executeTransaction(
            (session) => this.#updateNotificationReadStatus(notificationId, session),
            {message: statusMessages.NOTIFICATION_MARK_READ_FAILED}
        );
    }

    /**
     * @private
     * Updates all notifications read status for user
     * @param {string} userId
     * @param {Object} session
     * @returns {Promise<void>}
     */
    async #updateAllNotificationsReadStatus(userId, session) {
        await this.#notificationRepo.markAllAsRead({userId}, {session});
        await this.#notificationCache.clear(userId);
        await this.#notificationCache.setUnreadCount(userId, 0);
    }

    /**
     * Marks all notifications as read for user
     * @param {Object} params
     * @param {string} params.userId
     * @returns {Promise<void>}
     */
    async markAllAsRead({userId}) {
        await this.#notificationRepo.executeTransaction(
            (session) => this.#updateAllNotificationsReadStatus(userId, session),
            {message: statusMessages.NOTIFICATIONS_MARK_READ_FAILED}
        );
    }

    /**
     * @private
     * Gets unread count from cache or database
     * @param {string} userId
     * @returns {Promise<number>}
     */
    async #fetchUnreadCount(userId) {
        const cachedCount = await this.#notificationCache.getUnreadCount(userId);
        if (cachedCount !== undefined) return cachedCount;

        const count = await this.#notificationRepo.getUnreadCount({userId});
        await this.#notificationCache.setUnreadCount(userId, count);
        return count;
    }

    /**
     * Gets unread notification count
     * @param {Object} params
     * @param {string} params.userId
     * @returns {Promise<number>}
     */
    async getUnreadCount({userId}) {
        try {
            return await this.#fetchUnreadCount(userId);
        } catch (err) {
            throw new AppError(
                statusMessages.NOTIFICATION_UNREAD_COUNT_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = NotificationService;
