const Joi = require("joi");

const querySchema = Joi.object({
    page: Joi.number().integer().min(0).default(0),
    perPage: Joi.number().integer().min(1).max(50).default(10),
    sort: Joi.object({
        createdAt: Joi.number().valid(-1, 1).default(-1),
        updatedAt: Joi.number().valid(-1, 1).default(-1),
        title: Joi.number().valid(-1, 1).default(1),
        isPinned: Joi.number().valid(-1, 1).default(-1),
        tags: Joi.number().valid(-1, 1).default(1),
    }).default({
        isPinned: -1,
        updatedAt: -1,
        createdAt: -1
    }),
    searchText: Joi.string().trim().empty('').optional()
});


module.exports = querySchema;