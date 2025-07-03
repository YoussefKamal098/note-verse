const Joi = require('joi');
const objectIdSchema = require('./idKeyObject.schema')
const roles = require("../enums/roles.enum");

const grantPermissionsSchema = Joi.object({
    userIds: Joi.array().items(objectIdSchema().messages({
        'any.invalid': 'Each userId must be a valid ObjectId'
    }))
        .min(1)
        .max(25)
        .required()
        .messages({
            'any.required': 'userIds is required',
            'array.base': 'userIds must be an array',
            'array.min': 'userIds cannot be empty',
            'array.max': 'userIds cannot exceed 20 id',
            'any.invalid': 'Each userId must be a valid ObjectId'
        }),
    role: Joi.string().valid(...[roles.VIEWER, roles.EDITOR]).required()
        .messages({
            'any.only': 'Role must be either viewer or editor',
            'any.required': 'Role is required'
        }),
    notify: Joi.boolean().default(false),
    message: Joi.when('notify', {
        is: true,
        then: Joi.string()
            .min(0)
            .max(500)
            .required()
            .messages({
                'string.empty': 'Message is required when notifications are enabled',
                'string.min': 'Message must be at least 25 characters',
                'string.max': 'Message cannot exceed 100 characters'
            }),
        otherwise: Joi.string().empty().allow('').optional()
    })
}).options({allowUnknown: false});

module.exports = grantPermissionsSchema;
