const BaseRepository = require('./base.repository');
const dbErrorCodes = require("@/constants/dbErrorCodes");

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
     * Encodes a cursor value (e.g., a timestamp or ID) into a base64url string
     * for safe transport over HTTP query parameters.
     *
     * @private
     * @param {string|Date|number} value - The value to encode (commonly a date or ObjectId timestamp).
     * @returns {string} Base64url-encoded cursor string
     */
    #encodeCursor(value) {
        return Buffer.from(value.toString()).toString("base64url");
    }

    /**
     * Decodes a base64url-encoded cursor back into its original string value.
     *
     * @private
     * @param {string} cursor - The base64url-encoded cursor string
     * @returns {string|null} Decoded string value, or null if decoding fails
     */
    #decodeCursor(cursor) {
        try {
            return Buffer.from(cursor, "base64url").toString("utf8");
        } catch {
            return null;
        }
    }


    /**
     * Retrieves notifications for a specific user with cursor-based pagination,
     * sorted from newest to oldest by `createdAt`.
     *
     * @async
     * @param {Object} params
     * @param {string} params.userId - The ID of the user whose notifications to fetch
     * @param {Object} [options] - Query options
     * @param {number} [options.limit=20] - Maximum number of notifications to return
     * @param {string|null} [options.cursor=null] - Encoded cursor representing the last fetched notification's `createdAt`
     * @param {Object|string|null} [options.projection=null] - Fields to include/exclude in results
     * @param {Object} [options.filter={}] - Additional filter criteria
     * @param {boolean} [options.filter.read] - Filter notifications by read status
     * @param {import("mongoose").ClientSession|null} [options.session=null] - Optional MongoDB transaction session
     *
     * @returns {Promise<{data: ReadonlyArray<Readonly<NotificationOutput>>, nextCursor: string|null}>}
     * - `data`: Frozen array of sanitized notifications
     * - `nextCursor`: Encoded cursor for the next page, or null if no more results
     *
     * @throws {Error} If retrieval fails
     */
    async getUserNotifications({userId}, {
        limit = 20,
        cursor = null,
        projection = null,
        filter = {},
        session = null
    } = {}) {
        if (!this.isValidId(userId)) return {data: Object.freeze([]), nextCursor: null};

        const queryConditions = {
            recipient: this.toObjectId(userId),
            ...((filter && typeof filter.read === "boolean") ? {read: filter.read} : {})
        };

        if (cursor) {
            const decodedCursor = this.#decodeCursor(cursor); // decode base64
            if (decodedCursor) {
                queryConditions.createdAt = {$lt: new Date(decodedCursor)};
            }
        }

        try {
            const query = this._model.find(queryConditions)
                .sort({createdAt: -1}) // newest → oldest by createdAt
                .limit(limit + 1)
                .session(session);

            if (projection) query.select(projection);

            const notifications = await query.lean();
            const hasNext = notifications.length > limit;
            const results = hasNext ? notifications.slice(0, limit) : notifications;

            const nextCursor = hasNext
                ? this.#encodeCursor(results[results.length - 1].createdAt.toISOString())
                : null;

            return {
                data: this.freeze(this.#sanitizeNotification(results)),
                nextCursor
            };
        } catch (err) {
            console.error(`Failed to get notifications for user ${userId}:`, err);
            throw new Error("Failed to retrieve notifications. Please try again later");
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

    async markAllAsSeen({userId}, {session = null} = {}) {
        if (!this.isValidId(userId)) return;

        try {
            await this._model.updateMany(
                {recipient: this.toObjectId(userId), seen: false},
                {$set: {seen: true}},
                {session}
            );
        } catch (err) {
            console.error(`Failed to mark all notifications as seen for user ${userId}:`, err);
            throw new Error('Failed to mark notifications as seen. Please try again later');
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

    /**
     * Gets unseen notification count for a user
     * @param {Object} params
     * @param {string} params.userId - ID of the user
     * @param {Object} [options] - Options
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB transaction session
     * @returns {Promise<number>} Count of unseen notifications
     * @throws {Error} When count fails
     */
    async getUnseenCount({userId}, {session = null} = {}) {
        if (!this.isValidId(userId)) return 0;

        try {
            return await this._model.countDocuments({
                recipient: this.toObjectId(userId),
                seen: false
            }).session(session);
        } catch (err) {
            console.error(`Failed to get unseen count for user ${userId}:`, err);
            throw new Error('Failed to get unseen notification count. Please try again later');
        }
    }
}

module.exports = NotificationRepository;
