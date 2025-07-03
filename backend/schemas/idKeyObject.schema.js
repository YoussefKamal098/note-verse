const Joi = require('joi');
const {isValidObjectId} = require('../utils/obj.utils');

/**
 * Creates a configurable Joi schema for validating MongoDB ObjectIDs
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.allowMe=true] - Whether to accept "me" as a valid value
 * @param {string} [options.alias="me"] - Alternate alias to accept (defaults to "me")
 * @returns {Joi.StringSchema} Configured Joi schema
 *
 * @example
 * // Basic usage (allows "me" or ObjectID)
 * const schema = Joi.object({ userId: objectIdSchema() });
 *
 * @example
 * // Strict mode (only ObjectIDs)
 * const strictSchema = Joi.object({
 *   id: objectIdSchema({ allowMe: false })
 * });
 *
 * @example
 * // Custom alias ("self")
 * const customSchema = Joi.object({
 *   id: objectIdSchema({ alias: 'self' })
 * });
 */
const objectIdSchema = (options = {}) => {
    const {
        allowMe = false,
        alias = 'me'
    } = options;

    return Joi.string().custom((value, helpers) => {
        // Handle alias if enabled
        if (allowMe && value === alias) {
            return value;
        }

        // Validate ObjectID
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid', {
                message: allowMe
                    ? `must be a valid ObjectID or "${alias}"`
                    : 'must be a valid ObjectID'
            });
        }

        return value;
    }).messages({
        'any.invalid': '{{#message}}'
    });
};

module.exports = objectIdSchema;
