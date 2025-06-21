const Joi = require('joi');
const roles = require('../enums/roles.enum');

const updatePermissionSchema = Joi.object({
    role: Joi.string().valid(...[roles.VIEWER, roles.EDITOR]).required()
        .messages({
            'any.only': 'Role must be either viewer or editor',
            'any.required': 'Role is required'
        })
});

module.exports = updatePermissionSchema;
