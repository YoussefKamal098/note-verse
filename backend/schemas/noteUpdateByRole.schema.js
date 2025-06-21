const Joi = require('joi');
const roles = require('../enums/roles.enum');
const {convertToBytes} = require("shared-utils/string.utils");
const {deepFreeze} = require("shared-utils/obj.utils");

// Base schema for updating a note
const baseSchema = Joi.object({
    title: Joi.string()
        .max(100)
        .optional()
        .messages({
            'string.max': 'Title cannot exceed 100 characters'
        }),
    tags: Joi.array()
        .items(Joi.string().max(50))
        .min(1)
        .optional(),
    content: Joi.string()
        .max(convertToBytes("10KB"))
        .optional(),
    isPinned: Joi.boolean().optional(),
    isPublic: Joi.boolean().optional()
}).min(1); // Require at least one field to be present

// Role-based validation schemas
const noteUpdateByRoleSchema = deepFreeze({
    [roles.OWNER]: baseSchema,
    [roles.EDITOR]: baseSchema.keys({
        isPinned: Joi.forbidden(),
        isPublic: Joi.forbidden()
    }),
    [roles.VIEWER]: Joi.any().forbidden()
});

module.exports = noteUpdateByRoleSchema;
