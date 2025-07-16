const express = require('express');
const {makeClassInvoker} = require("awilix-express");
const asyncRequestHandler = require('../utils/asyncHandler');
const validateRequestMiddlewares = require('../middlewares/validateRequest.middleware');
const NotificationController = require('../controllers/notification.controller');
const {notificationsQuerySchema} = require('../schemas/notification.schemas');

const router = express.Router();
const api = makeClassInvoker(NotificationController);


// Get authenticated user notifications
router.get('/',
    asyncRequestHandler(validateRequestMiddlewares(notificationsQuerySchema, {isQuery: true})),
    asyncRequestHandler(api('getUserNotifications'))
);

// Mark notification as read
router.patch('/:notificationId/read',
    asyncRequestHandler(api('markAsRead'))
);

// Mark all notifications as read for user
router.patch('/read-all',
    asyncRequestHandler(api('markAllAsRead'))
);

// Get unread notification count
router.get('/unread-count',
    asyncRequestHandler(api('getUnreadCount'))
);

module.exports = router;
