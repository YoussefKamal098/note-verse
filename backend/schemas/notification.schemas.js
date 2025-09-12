const Joi = require('joi');

// Schema for querying notifications (cursor-based pagination)
const notificationsQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10)
        .description('Maximum number of notifications to return'),
    cursor: Joi.string().allow(null, '').optional()
        .description('Cursor for pagination (last fetched createdAt encoded)'),
    filter: Joi.object({
        read: Joi.boolean().optional().description('Filter by read status (true/false)'),
    }).optional(),
    projection: Joi.alternatives()
        .try(Joi.string(), Joi.object())
        .optional()
        .description('Projection fields to include/exclude'),
});

module.exports = {notificationsQuerySchema};
