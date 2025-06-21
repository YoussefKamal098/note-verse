const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');

/**
 * Resolves "me" identifier to userId in query, params, or body
 * @param {Object} options - Configuration options
 * @param {string[]} [options.fields=['id']] - Field names to check for "me"
 */
const resolveMeIdentifier = (options = {}) => {
    const fieldsToCheck = options.fields || ['id'];

    return (req, res, next) => {
        try {
            if (!req.userId) {
                return next(new AppError(
                    'Authentication required to use "me" identifier',
                    httpCodes.UNAUTHORIZED.code,
                    httpCodes.UNAUTHORIZED.name
                ));
            }

            // Check all potential locations
            const locations = [req.query, req.params, req.body];

            locations.forEach(location => {
                if (!location) return;

                fieldsToCheck.forEach(field => {
                    if (location[field] === 'me') {
                        location[field] = req.userId;
                    }
                });
            });

            next();
        } catch (error) {
            next(new AppError(
                'Failed to resolve user reference',
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            ));
        }
    };
};

module.exports = resolveMeIdentifier;
