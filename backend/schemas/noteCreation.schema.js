const Joi = require("joi");
const {convertToBytes} = require("shared-utils/string.utils");

const noteCreationSchema = Joi.object({
    title: Joi.string()
        .required()
        .max(100)
        .messages({
            'string.base': 'Title must be a string',
            'string.empty': 'Title is required',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),
    tags: Joi.array()
        .items(Joi.string().max(50))
        .min(1)
        .required()
        .messages({
            'array.base': 'Tags must be an array',
            'array.min': 'At least one tag is required',
            'any.required': 'Tags are required'
        }),
    content: Joi.string()
        .required()
        .max(convertToBytes("10KB"))
        .messages({
            'string.base': 'Content must be a string',
            'string.empty': 'Content is required',
            'string.max': 'Content cannot exceed 10 KB',
            'any.required': 'Content is required'
        }),
    isPinned: Joi.boolean().optional(),
    isPublic: Joi.boolean().optional()
});

module.exports = noteCreationSchema;
