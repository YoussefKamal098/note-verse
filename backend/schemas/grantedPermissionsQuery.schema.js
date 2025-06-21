const Joi = require('joi');
const resources = require("../enums/resources.enum");

module.exports = Joi.object({
    page: Joi.number().integer().min(0).optional(),
    limit: Joi.number().integer().min(1).optional(),
    resource: Joi.string().valid(...Object.values(resources))
        .messages({'any.only': 'Resource must be either note or file'})
});
