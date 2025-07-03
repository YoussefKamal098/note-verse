const Joi = require("joi");
const commonSchema = require("./noteShared.schema");

const noteCreationSchema = Joi.object({
    ...commonSchema,
    title: commonSchema.title.required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required'
    }),
    tags: commonSchema.tags.required().messages({
        'any.required': 'Tags are required'
    }),
    content: commonSchema.content.required().messages({
        'string.empty': 'Content is required',
        'any.required': 'Content is required'
    })
});

module.exports = noteCreationSchema;
