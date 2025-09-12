const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');

class NotificationController {
    /**
     * @private
     * @type {NotificationService}
     */
    #notificationService;

    constructor({notificationService}) {
        this.#notificationService = notificationService;
    }

    /**
     * Get user notifications (cursor-based)
     */
    async getUserNotifications(req, res) {
        const {userId} = req;
        const {limit, cursor, filter, projection} = req.query;

        const result = await this.#notificationService.getUserNotifications(
            {userId},
            {limit, cursor, filter, projection}
        );

        res.status(httpCodes.OK.code).json(result);
    }

    /**
     * Mark notification as read
     */
    async markAsRead(req, res) {
        const {notificationId} = req.params;
        const notification = await this.#notificationService.markAsRead({notificationId});

        if (!notification) {
            throw new AppError(
                statusMessages.NOTIFICATION_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json(notification);
    }

    /**
     * Mark all notifications as seen for user
     */
    async markAllAsSeen(req, res) {
        const {userId} = req;
        await this.#notificationService.markAllAsSeen({userId});
        res.status(httpCodes.OK.code).json({success: true});
    }

    /**
     * Mark all notifications as read for user
     */
    async markAllAsRead(req, res) {
        const {userId} = req;
        await this.#notificationService.markAllAsRead({userId});
        res.status(httpCodes.OK.code).json({success: true});
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(req, res) {
        const {userId} = req;
        const count = await this.#notificationService.getUnreadCount({userId});
        res.status(httpCodes.OK.code).json({count});
    }

    /**
     * Get unseen notification count
     */
    async getUnseenCount(req, res) {
        const {userId} = req;
        const count = await this.#notificationService.getUnseenCount({userId});
        res.status(httpCodes.OK.code).json({count});
    }
}

module.exports = NotificationController;
