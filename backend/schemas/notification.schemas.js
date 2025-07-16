const Joi = require('joi');

// Schema for querying notifications
const notificationsQuerySchema = Joi.object({
    page: Joi.number().integer().min(0).max(20).default(0)
        .description('Page number (0-based)'),
    limit: Joi.number().integer().min(1).max(100).default(10)
        .description('Items per page'),
    filter: Joi.object({
        read: Joi.boolean().optional().description('Filter by read status (true/false)'),
    }).optional(),
});

module.exports = {notificationsQuerySchema};
