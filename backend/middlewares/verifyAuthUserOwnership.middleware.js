const httpCodes = require('../constants/httpCodes');
const AppError = require('../errors/app.error');

/**
 * Middleware to verify authenticated user's ownership of a resource
 * @param {Object} options Configuration options
 * @param {string} [options.paramName='userId'] Parameter name to check
 * @param {string[]} [options.locations=['params']] Request locations to check ('params', 'query', 'body')
 * @param {boolean} [options.allowMe=true] Whether to accept "me" as valid value
 * @returns {Function} Express middleware function
 *
 * @example
 * // Basic usage (checks req.params.userId)
 * router.get('/:userId', verifyOwnership(), userController.getUser);
 *
 * @example
 * // Custom parameter in body
 * router.patch('/profile',
 *   verifyOwnership({ paramName: 'ownerId', locations: ['body'] }),
 *   profileController.update
 * );
 */
function verifyOwnership(options = {}) {
    const {
        paramName = 'userId',
        locations = ['params'],
        allowMe = true
    } = options;

    return async (req, res, next) => {
        try {
            // 1. Find the target value in specified locations
            let targetValue;
            for (const location of locations) {
                if (req[location]?.[paramName] !== undefined) {
                    targetValue = req[location][paramName];
                    break;
                }
            }

            // 2. Handle "me" alias if enabled
            if (allowMe && targetValue === 'me') {
                if (!req.userId) {
                    return next(new AppError(
                        'Authentication required to use "me" identifier',
                        httpCodes.UNAUTHORIZED.code,
                        httpCodes.UNAUTHORIZED.name
                    ));
                }
                targetValue = req.userId;
            }

            // 3. Verify ownership
            if (req.userId !== targetValue) {
                return next(new AppError(
                    httpCodes.FORBIDDEN.message,
                    httpCodes.FORBIDDEN.code,
                    httpCodes.FORBIDDEN.name
                ));
            }

            // 4. Update the original location with resolved value
            for (const location of locations) {
                if (req[location]?.[paramName] !== undefined) {
                    req[location][paramName] = targetValue;
                    break;
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = verifyOwnership;