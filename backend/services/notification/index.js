const AppError = require('@/errors/app.error');
const httpCodes = require('@/constants/httpCodes');
const statusMessages = require('@/constants/statusMessages');
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

            const unseenCount = notifications.filter(
                n => n.recipient === recipient && !n.seen
            ).length;
            if (unseenCount > 0) {
                await this.#notificationCache.incrementUnseenCount(recipient, unseenCount);
            }
        }
    }

    /**
     * @private
     * Handles batch creation retry logic
     * @param {Array<NotificationInput>} notifications
     * @param {Object} session
     * @returns {Promise<ReadonlyArray<Readonly<NotificationOutput>>>}
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
        await this.#notificationCache.incrementUnseenCount(data.recipient);

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
     * @returns {Promise<{data: ReadonlyArray<Readonly<EnhancedNotificationOutput>>, nextCursor: string|null}>}
     * - `data`: Frozen array of sanitized notifications
     * - `nextCursor`: Encoded cursor for the next page, or null if no more results
     */
    async #retrieveNotifications(userId, options) {
        const cached = await this.#notificationCache.get(
            userId,
            options.cursor,
            options.limit,
            options.filter,
            options.projection
        );

        if (cached) return deepFreeze(cached);

        const result = await this.#notificationRepo.getUserNotifications(
            {userId},
            options
        );

        const notifications = result.data;
        const enhancedNotifications = await Promise.all(
            notifications.map(n => this.#enhanceNotification(n)))

        return deepFreeze({
            ...result,
            data: enhancedNotifications
        });
    }

    /**
     * Retrieves notifications for a specific user with cursor-based pagination,
     * sorted from newest to oldest by `createdAt`.
     *
     * @async
     * @param {Object} params
     * @param {string} params.userId - ID of the user whose notifications to fetch
     * @param {Object} [options] - Query options
     * @param {number} [options.limit=10] - Maximum number of notifications to return
     * @param {string|null} [options.cursor=null] - Encoded cursor representing the last fetched notification's `createdAt`
     * @param {Object} [options.filter={}] - Additional filter criteria
     * @param {boolean} [options.filter.read] - Filter notifications by read status
     * @param {Object|string|null} [options.projection=null] - Fields to include/exclude in results
     *
     * @returns {Promise<{data: ReadonlyArray<Readonly<EnhancedNotificationOutput>>, nextCursor: string|null}>}
     * - `data`: Frozen array of enhanced notifications
     * - `nextCursor`: Encoded cursor for the next page, or null if no more results
     *
     * @throws {AppError} When retrieval fails
     */
    async getUserNotifications(
        {userId},
        {limit = 10, cursor = null, filter = {}, projection = null} = {}
    ) {
        try {
            const enhancedNotifications = await this.#retrieveNotifications(
                userId,
                {limit, cursor, filter, projection}
            );

            // Cache the result (cursor-based instead of page-based)
            await this.#notificationCache.set(userId, enhancedNotifications, cursor, limit, filter, projection);

            return enhancedNotifications;
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
     * Marks all notifications as seen for a user within a transaction session
     * and clears the user's notification cache.
     *
     * @async
     * @param {string} userId - ID of the user whose notifications should be marked as seen
     * @param {import("mongoose").ClientSession} session - The active transaction session
     * @returns {Promise<void>}
     */
    async #updateAllNotificationsSeenStatus(userId, session) {
        await this.#notificationRepo.markAllAsSeen({userId}, {session});
        await this.#notificationCache.clear(userId);

        await this.#notificationCache.clear(userId);
        await this.#notificationCache.setUnseenCount(userId, 0);
    }

    /**
     * Marks all notifications as seen for a user.
     * Executes the update inside a transaction and handles cache invalidation.
     *
     * @async
     * @param {Object} params - Parameters object
     * @param {string} params.userId - ID of the user
     * @returns {Promise<void>}
     * @throws {AppError} If marking notifications as seen fails
     */
    async markAllAsSeen({userId}) {
        await this.#notificationRepo.executeTransaction(
            (session) => this.#updateAllNotificationsSeenStatus(userId, session),
            {message: statusMessages.NOTIFICATIONS_MARK_SEEN_FAILED}
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

    /**
     * Gets unseen notification count
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @returns {Promise<number>} Number of unseen notifications
     * @throws {AppError} When unseen count retrieval fails
     */
    async getUnseenCount({userId}) {
        try {
            return await this.#fetchUnseenCount(userId);
        } catch (err) {
            throw new AppError(
                statusMessages.NOTIFICATION_UNSEEN_COUNT_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * @private
     * Gets unseen count from cache or database
     * @param {string} userId - ID of the user
     * @returns {Promise<number>} Unseen notification count
     */
    async #fetchUnseenCount(userId) {
        const cachedCount = await this.#notificationCache.getUnseenCount(userId);
        if (cachedCount !== undefined) return cachedCount;

        const count = await this.#notificationRepo.getUnseenCount({userId});
        await this.#notificationCache.setUnseenCount(userId, count);
        return count;
    }

}

module.exports = NotificationService;
