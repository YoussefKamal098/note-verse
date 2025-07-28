const Joi = require('joi');
const roles = require('../enums/roles.enum');
const commonSchema = require("./noteShared.schema");

// Base schema for updating a note
const baseSchema = Joi.object({
    ...Object.fromEntries(
        Object.entries(commonSchema).map(([key, validation]) => [
            key,
            validation.optional()
        ])
    ),
    commitMessage: Joi.when('content', {
        is: Joi.exist(),
        then: Joi.string()
            .min(10)
            .max(200)
            .required()
            .messages({
                'string.min': 'Commit message must be at least 10 characters',
                'string.max': 'Commit message cannot exceed 200 characters',
                'any.required': 'Commit message is required when updating content'
            }),
        otherwise: Joi.forbidden()
    })
}).min(1); // Require at least one field to be present

// Role-based validation schemas
const noteUpdateByRoleSchema = {
    [roles.OWNER]: baseSchema,
    [roles.EDITOR]: baseSchema.keys({
        title: Joi.forbidden(),
        tags: Joi.forbidden(),
        isPinned: Joi.forbidden(),
        isPublic: Joi.forbidden()
    }),
    [roles.VIEWER]: Joi.any().forbidden()
};

module.exports = noteUpdateByRoleSchema;
