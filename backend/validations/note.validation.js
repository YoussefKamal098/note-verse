const Joi = require('joi');
const AppError = require('../errors/app.error');

class NoteValidationService {
    constructor() {
        // I will sanitize the strings in title and tags and content later
        this.titleSchema = Joi.string()
            .required()
            .max(100)
            .messages({
                'string.base': 'Title must be a string.',
                'string.empty': 'Title is required.',
                'string.max': 'Title cannot exceed 100 characters.',
                'any.required': 'Title is required.',
            });

        this.tagsSchema = Joi.array()
            .items(Joi.string().max(50).messages({
                'string.base': 'Each tag must be a string.',
                'string.max': 'Each tag cannot exceed 50 characters.',
            }))
            .min(1)
            .required()
            .messages({
                'array.base': 'Tags must be an array.',
                'array.min': 'Tags cannot be empty.',
                'any.required': 'Tags are required.',
            });

        this.contentSchema = Joi.string()
            .required()
            .max(1024 * 10) // 10KB
            .messages({
                'string.base': 'Content must be a string.',
                'string.empty': 'Content is required.',
                'string.max': 'Content cannot exceed 10 KB.',
                'any.required': 'Content is required.',
            });

        this.isPinnedSchema = Joi.boolean()
            .required()
            .messages({
                'string.base': 'IsPinned must be a boolean.',
                'any.required': 'IsPinned is required.',
            });
    }

    validateTitle(value) {
        const { error } = this.titleSchema.validate(value);
        if (error) {
            throw new AppError(`Title: ${error.details[0].message}`, 400);
        }
        return true;
    }

    validateTags(value) {
        const { error } = this.tagsSchema.validate(value);
        if (error) {
            throw new AppError(`Tags: ${error.details[0].message}`, 400);
        }
        return true;
    }

    validateContent(value) {
        const { error } = this.contentSchema.validate(value);
        if (error) {
            throw new AppError(`Content: ${error.details[0].message}`, 400);
        }
        return true;
    }


    validateIsPinned(value) {
        const { error } = this.isPinnedSchema.validate(value);
        if (error) {
            throw new AppError(`IsPinned: ${error.details[0].message}`, 400);
        }
        return true;
    }
}

module.exports = NoteValidationService;