const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');

/**
 * Factory function that creates Express middleware to validate request data against a Joi schema
 * @module Middleware/Validation
 * @param {import('joi').Schema} schema - The Joi validation schema to use
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.isQuery=false] - Whether to validate query parameters instead of request body
 * @returns {Function} Express middleware function that validates the request
 *
 * @example
 * // Validate request body:
 * router.post('/users',
 *   validateRequest(userSchema),
 *   userController.createUser
 * );
 *
 * @example
 * // Validate query parameters:
 * router.get('/search',
 *   validateRequest(searchSchema, { isQuery: true }),
 *   searchController.search
 * );
 */
function validateRequest(schema, {isQuery = false} = {}) {
    /**
     * Express middleware to validate request data
     * @function
     * @param {import('express').Request} req - Express request object
     * @param {Object} [req.body] - Request body to validate (when isQuery=false)
     * @param {Object} [req.query] - Query parameters to validate (when isQuery=true)
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next middleware function
     * @throws {AppError} 400 - BAD_REQUEST with validation error messages if validation fails
     *
     * On successful validation:
     * - Replaces req.body or req.query with the validated and potentially coerced values
     * - Calls next() to proceed to the next middleware
     */
    return (req, res, next) => {
        const {value, error} = schema.validate(isQuery ? req.query : req.body, {
            abortEarly: false,  // Return all validation errors, not just the first one
            allowUnknown: false // Disallow unknown keys in the input
        });

        if (error) {
            const message = error.details.map((d) => d.message).join(', ');
            return next(new AppError(message, httpCodes.BAD_REQUEST.code));
        }

        // Replace the original data with validated and coerced values
        if (!isQuery) {
            req.body = value;
        } else {
            req.query = value;
        }

        next();
    };
}

module.exports = validateRequest;
