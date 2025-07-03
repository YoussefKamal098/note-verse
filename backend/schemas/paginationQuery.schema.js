const Joi = require('joi');

/**
 * Schema for standardized pagination queries
 * @type {Joi.ObjectSchema}
 */
const paginationQuerySchema = Joi.object({
    // Page number (0-indexed)
    page: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .description('Page number (0-indexed)'),

    // Items per page
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)  // Prevent excessive load
        .default(10)
        .description('Items per page (max 100)'),

    // Optional projection fields
    projection: Joi.alternatives()
        .try(
            Joi.string(),  // e.g., 'title,content'
            Joi.object()   // e.g., { title: 1, content: 1 }
        )
        .optional()
        .description('Fields to include/exclude'),

    // Optional sorting criteria
    sort: Joi.alternatives()
        .try(
            Joi.string(),  // e.g., 'createdAt,-title' (descending)
            Joi.object()   // e.g., { createdAt: 1, title: -1 }
        )
        .optional()
        .description('Sorting criteria')
});

module.exports = paginationQuerySchema;
