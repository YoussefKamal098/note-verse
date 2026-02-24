const Joi = require("joi");

const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    cursor: Joi.string().allow(null).default(null),
    searchText: Joi.string().trim().empty('').optional()
});

module.exports = querySchema;