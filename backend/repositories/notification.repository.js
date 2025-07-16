const BaseRepository = require('./base.repository');
const dbErrorCodes = require("../constants/dbErrorCodes");

/**
 * @class NotificationRepository
 * @extends BaseRepository
 * @description Repository class for managing notification documents in MongoDB
 *
 * Provides CRUD operations and specialized notification management functions
 * including marking notifications as read, batch operations, and unread counts.
 */
class NotificationRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    /**
     * Sanitizes notification MongoDB documents
     * @private
     * @param {NotificationOutput|Array<NotificationOutput>} notification - Notification document(s) from MongoDB
     * @returns {NotificationOutput|Array<NotificationOutput>} Sanitized notification object(s)
     */
    #sanitizeNotification(notification) {
        const sanitized = this.sanitizeDocument(notification);
        if (sanitized.recipient) {
            sanitized.recipient = sanitized.recipient.toString();
        }
        return sanitized;
    }

    /**
     * Creates multiple notifications in a batch
     * @param {Array<NotificationInput>} notifications - Array of notification data objects
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<Array<NotificationOutput>>>} Array of created notification documents
     * @throws {Error} When batch creation fails
     */
    async batchCreate(notifications = [], {session = null} = {}) {
        try {
            const insertedNotifications = await this._model.insertMany(
                notifications.map(n => ({
                    ...n,
                    recipient: this.toObjectId(n.recipient)
                })),
                {
                    ordered: false,
                    lean: true,
                    rawResult: false,
                    session
                }
            );
            return this.freeze(this.#sanitizeNotification(insertedNotifications));
        } catch (err) {
            if (err.code === dbErrorCodes.DUPLICATE_KEY) {
                const conflictError = new Error('Duplicate notification detected');
                conflictError.code = dbErrorCodes.DUPLICATE_KEY;
                throw conflictError;
            }

            console.error("Notification batch creation failed:", err);
            throw new Error(`Failed to create notifications: ${err.message}`);
        }
    }

    /**
     * Creates a single notification
     * @param {NotificationInput} data - Notification input data
     * @param {string|Object} data.recipient - ID of the recipient user (can be string or ObjectId)
     * @param {string} data.type - Type of the notification (e.g. "login", "note_update")
     * @param {Object} [data.payload] - Optional payload associated with the notification
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<NotificationOutput>>} The created notification document
     * @throws {Error} When creation fails
     */
    async create({recipient, type, payload} = {}, {session = null} = {}) {
        try {
            const notification = new this._model({
                type,
                payload,
                recipient: this.toObjectId(recipient)
            });
            await notification.save({session});
            return this.freeze(this.#sanitizeNotification(notification.toObject()));
        } catch (err) {
            console.error("Notification creation failed:", err);
            throw new Error(`Failed to create notification: ${err.message}`);
        }
    }

    /**
     * Gets notifications for a specific user with pagination
     * @param {Object} params
     * @param {string} params.userId - ID of the user to get notifications for
     * @param {Object} [options] - Options
     * @param {number} [options.page=0] - Page number (0-based)
     * @param {number} [options.limit=20] - Results per page
     * @param {Object|string} [options.projection] - Fields to include/exclude
     * @param {Object} [options.filter] - Filter criteria
     * @param {boolean} [options.filter.read] - Filter by read status (true/false)
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<Array<NotificationOutput>>>} Array of notification documents (empty if none found)
     * @throws {Error} When retrieval fails
     */
    async getUserNotifications({userId}, {
        page = 0,
        limit = 20,
        projection = null,
        filter = {},
        session = null
    } = {}) {
        if (!this.isValidId(userId)) return this.freeze([]);

        const skip = page * limit;

        // Base query - always filter by recipient
        const queryConditions = {
            recipient: this.toObjectId(userId)
        };

        // Apply additional filters if provided
        if (filter && typeof filter.read === 'boolean') {
            queryConditions.read = filter.read;
        }

        try {
            const query = this._model.find(queryConditions)
                .sort({createdAt: -1})
                .skip(skip)
                .limit(limit)
                .session(session);

            if (projection) {
                query.select(projection);
            }

            const notifications = await query.lean();
            return this.freeze(this.#sanitizeNotification(notifications));
        } catch (err) {
            console.error(`Failed to get notifications for user ${userId}:`, err);
            throw new Error('Failed to retrieve notifications. Please try again later');
        }
    }

    /**
     * Marks a notification as read
     * @param {Object} params
     * @param {string} params.notificationId - ID of the notification to mark as read
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<Readonly<NotificationOutput|null>>} Updated notification document or null if not found
     * @throws {Error} When update fails
     */
    async markAsRead({notificationId}, {session = null} = {}) {
        if (!this.isValidId(notificationId)) return null;

        try {
            const notification = await this._model.findByIdAndUpdate(
                this.toObjectId(notificationId),
                {read: true},
                {new: true, session}
            ).lean();

            return notification ? this.freeze(this.#sanitizeNotification(notification)) : null;
        } catch (err) {
            console.error(`Failed to mark notification ${notificationId} as read:`, err);
            throw new Error('Failed to mark notification as read. Please try again later');
        }
    }

    /**
     * Marks all unread notifications for a user as read
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<void>}
     * @throws {Error} When update fails
     */
    async markAllAsRead({userId}, {session = null} = {}) {
        if (!this.isValidId(userId)) return;

        try {
            await this._model.updateMany(
                {
                    recipient: this.toObjectId(userId),
                    read: false
                },
                {$set: {read: true}},
                {session}
            );
        } catch (err) {
            console.error(`Failed to mark all notifications as read for user ${userId}:`, err);
            throw new Error('Failed to mark notifications as read. Please try again later');
        }
    }

    /**
     * Gets unread notification count for a user
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<number>} Count of unread notifications
     * @throws {Error} When count fails
     */
    async getUnreadCount({userId}, {session = null} = {}) {
        if (!this.isValidId(userId)) return 0;

        try {
            return await this._model.countDocuments({
                recipient: this.toObjectId(userId),
                read: false
            }).session(session);
        } catch (err) {
            console.error(`Failed to get unread count for user ${userId}:`, err);
            throw new Error('Failed to get unread notification count. Please try again later');
        }
    }
}

module.exports = NotificationRepository;
