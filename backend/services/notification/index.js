const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const {deepFreeze} = require("shared-utils/obj.utils");
const NotificationProcessorFactory = require("./processors/notificationProcessorFactory")


/**
 * Service for managing notifications with transaction support.
 * Handles notification creation, retrieval, and status updates with proper transaction management.
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
     * Enhances notification with combined resources
     * @private
     * @param {NotificationOutput} notification
     * @returns {Promise<Readonly<EnhancedNotificationOutput | NotificationOutput>>}
     */
    async #enhanceNotification(notification) {
        if (!notification.payload) {
            return deepFreeze({notification});
        }

        const processor = this.#processorFactory.getProcessor(notification.type);
        if (!processor) {
            return deepFreeze({notification});
        }

        const enhancedPayload = await processor.process(notification.payload);

        return deepFreeze({
            ...notification,
            payload: enhancedPayload
        });
    }

    /**
     * Creates multiple notifications in a batch with retry logic
     * @param {Array<NotificationInput>} notifications - Array of notification data objects
     * @returns {Promise<Readonly<Array<Readonly<EnhancedNotificationOutput>>>>} Array of created notification documents
     * @throws {AppError} When batch creation fails
     */
    async batchCreate(notifications) {
        let attempts = 0;
        let lastError = null;
        let insertedNotifications = null;

        return this.#notificationRepo.executeTransaction(async (session) => {
            while (attempts < NotificationService.#MAX_RETRIES) {
                try {
                    insertedNotifications = await this.#notificationRepo.batchCreate(notifications, {session});

                    // Update cache for all unique recipients
                    const recipients = new Set(insertedNotifications.map(n => n.recipient));
                    const recipientsClearedCache = new Set();
                    for (const recipient of recipients) {
                        if (recipientsClearedCache.has(recipient)) {
                            await this.#notificationCache.clear(recipient);
                            recipientsClearedCache.add(recipient);
                        }
                        // Increment unread count for each unread notification
                        const unreadCount = insertedNotifications.filter(n =>
                            n.recipient === recipient && !n.read
                        ).length;
                        if (unreadCount > 0) {
                            await this.#notificationCache.incrementUnreadCount(recipient, unreadCount);
                        }
                    }

                    break;
                } catch (err) {
                    if (!err.writeErrors && attempts >= NotificationService.#MAX_RETRIES - 1) {
                        throw new AppError(
                            statusMessages.NOTIFICATIONS_CREATION_FAILED,
                            httpCodes.INTERNAL_SERVER_ERROR.code,
                            httpCodes.INTERNAL_SERVER_ERROR.name
                        );
                    }
                    lastError = err;
                    attempts++;
                    await new Promise(res => setTimeout(res, 500 * attempts)); // Exponential backoff
                }
            }

            if (!insertedNotifications) {
                throw new AppError(
                    lastError?.message || statusMessages.NOTIFICATIONS_CREATION_FAILED,
                    httpCodes.INTERNAL_SERVER_ERROR.code,
                    httpCodes.INTERNAL_SERVER_ERROR.name
                );
            }

            // Emit notifications to online users
            const enhanced = await Promise.all(
                insertedNotifications.map(n => this.#enhanceNotification(n))
            );
            await this.#notificationEmitter.emitBatch(enhanced);

            return deepFreeze(enhanced);
        }, {
            message: statusMessages.NOTIFICATIONS_CREATION_FAILED,
            conflictMessage: statusMessages.NOTIFICATION_CONFLICT
        });
    }

    /**
     * Creates a single notification
     * @param {NotificationInput} data - Notification data
     * @returns {Promise<Readonly<EnhancedNotificationOutput>>} The created notification document
     * @throws {AppError} When creation fails
     */
    async create(data) {
        return this.#notificationRepo.executeTransaction(async (session) => {
            const result = await this.#notificationRepo.create(data, {session});

            await this.#notificationCache.clear(data.recipient);
            await this.#notificationCache.incrementUnreadCount(data.recipient);
            const enhanced = await this.#enhanceNotification(result);

            if (await this.#onlineUserService.isOnline(data.recipient)) {
                await this.#notificationEmitter.emitToUser(data.recipient, enhanced);
            }
            return enhanced;
        }, {
            message: statusMessages.NOTIFICATION_CREATION_FAILED
        });
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
            // Try to get from cache first
            const cached = await this.#notificationCache.get(userId, page, limit, filter, projection);
            if (cached) return deepFreeze(cached);

            // If not in cache, get from DB
            const notifications = await this.#notificationRepo.getUserNotifications(
                {userId},
                {page, limit, filter, projection}
            );

            const enhancedNotifications = await Promise.all(
                notifications.map(n => this.#enhanceNotification(n))
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
     * Marks a notification as read
     * @param {Object} params
     * @param {string} params.notificationId - ID of the notification to mark as read
     * @returns {Promise<Readonly<NotificationOutput|null>>} Updated notification document or null if not found
     * @throws {AppError} When update fails
     */
    async markAsRead({notificationId}) {
        return await this.#notificationRepo.executeTransaction(async (session) => {
            const result = await this.#notificationRepo.markAsRead({notificationId}, {session});

            if (result) {
                await this.#notificationCache.clear(result.recipient);
                await this.#notificationCache.decrementUnreadCount(result.recipient);
            }

            return result;
        }, {
            message: statusMessages.NOTIFICATION_MARK_READ_FAILED
        });
    }

    /**
     * Marks all unread notifications for a user as read
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @returns {Promise<void>}
     * @throws {AppError} When update fails
     */
    async markAllAsRead({userId}) {
        await this.#notificationRepo.executeTransaction(async (session) => {
            await this.#notificationRepo.markAllAsRead({userId}, {session});

            await this.#notificationCache.clear(userId);
            await this.#notificationCache.setUnreadCount(userId, 0);
        }, {
            message: statusMessages.NOTIFICATIONS_MARK_READ_FAILED
        });

    }

    /**
     * Gets unread notification count for a user
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @returns {Promise<number>} Count of unread notifications
     * @throws {AppError} When count fails
     */
    async getUnreadCount({userId}) {
        try {
            // Try cache first
            const cachedCount = await this.#notificationCache.getUnreadCount(userId);
            if (cachedCount !== undefined) return cachedCount;

            // Cache miss - get from database
            const count = await this.#notificationRepo.getUnreadCount({userId});
            await this.#notificationCache.setUnreadCount(userId, count);
            return count;
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
