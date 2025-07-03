const Joi = require('joi');
const objectIdSchema = require("./idKeyObject.schema");

/**
 * Creates a configurable ID validation schema
 * @param {Object} config - Configuration options
 * @param {string} config.fieldName - Name of the ID field (e.g., 'userId', 'noteId')
 * @param {boolean} [config.allowMe=true] - Whether to accept "me" as valid value
 * @param {string} [config.alias="me"] - Alternate alias to accept
 * @param {boolean} [config.required=true] - Whether the field is required
 * @returns {Joi.ObjectSchema} Configured Joi schema
 *
 * @example
 * // Basic usage:
 * const userSchema = idSchema({ fieldName: 'userId' });
 *
 * @example
 * // Custom configuration:
 * const noteSchema = idSchema({
 *   fieldName: 'noteId',
 *   allowMe: false,
 *   required: false
 * });
 */
const idObjectSchema = ({fieldName, allowMe = false, alias = 'me', required = true}) => {
    const schema = Joi.object({
        [fieldName]: objectIdSchema({allowMe, alias}).messages({
            'any.invalid': '{{#message}}',
            'string.empty': `${fieldName} cannot be empty`
        })
    });

    return required ? schema.required() : schema.optional();
};

module.exports = idObjectSchema;
