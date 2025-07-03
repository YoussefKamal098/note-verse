const Joi = require('joi');
const roles = require('../enums/roles.enum');
const objectIdSchema = require('./idKeyObject.schema')


const updatePermissionSchema = Joi.object({
    noteId: objectIdSchema()
        .required()
        .messages({
            'any.required': 'noteId is required',
            'any.invalid': 'noteId must be a valid ObjectID'
        }),
    role: Joi.string().valid(...[roles.VIEWER, roles.EDITOR]).required()
        .messages({
            'any.only': 'Role must be either viewer or editor',
            'any.required': 'Role is required'
        })
});

module.exports = updatePermissionSchema;
