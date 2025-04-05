const Joi = require('joi');
const httpCodes = require("../constants/httpCodes");
const AppError = require('../errors/app.error');

class NoteQueryValidationService {
    constructor() {
        this.querySchema = Joi.object({
            page: Joi.number().integer().min(0).default(0),
            perPage: Joi.number().integer().min(1).max(50).default(10),
            sort: Joi.object({
                createdAt: Joi.number().valid(-1, 1).default(-1),
                updatedAt: Joi.number().valid(-1, 1).default(-1),
                title: Joi.number().valid(-1, 1).default(1),
                isPinned: Joi.number().valid(-1, 1).default(-1),
                tags: Joi.number().valid(-1, 1).default(1),
            }).default({
                isPinned: -1, updatedAt: -1, createdAt: -1
            }),
            searchText: Joi.string().optional().allow('').trim().empty(''),
        });
    }

    validateQuery(query) {
        const {error, value} = this.querySchema.validate(query);
        if (error) {
            throw new AppError(
                `Notes Query Parameters: ${error.details[0].message}`,
                httpCodes.BAD_REQUEST.code,
                httpCodes.BAD_REQUEST.name
            );
        }
        return value;
    }
}

module.exports = NoteQueryValidationService;
