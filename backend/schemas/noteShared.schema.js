const Joi = require('joi');
const {convertToBytes} = require("shared-utils/string.utils");

const schema = {
    title: Joi.string()
        .min(10)
        .max(100)
        .messages({
            'string.base': 'Title must be a string',
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 10 bytes long',
            'string.max': 'Title cannot exceed 100 characters',
        }),
    tags: Joi.array()
        .items(Joi.string()
            .min(3)
            .max(50)
            .messages({
                'string.min': 'Each tag must be at least 3 characters',
                'string.max': 'Each tag cannot exceed 50 characters',
                'string.base': 'Each tag must be a string'
            })
        )
        .min(1)
        .messages({
            'array.base': 'Tags must be an array',
            'array.min': 'At least one tag is required',
        }),
    content: Joi.string()
        .min(25)
        .max(convertToBytes("500KB"))
        .messages({
            'string.base': 'Content must be a string',
            'string.empty': 'Content is required',
            'string.min': 'Content must be at least 25 bytes long',
            'string.max': 'Content cannot exceed 500 KB',
        }),
    isPinned: Joi.boolean(),
    isPublic: Joi.boolean()
};

module.exports = schema;
