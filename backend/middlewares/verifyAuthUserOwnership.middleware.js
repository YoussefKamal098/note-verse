const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');

/**
 * Middleware to verify that the authenticated user has access to the resource.
 * It checks that the authenticated user's ID (req.userId) matches the userId parameter.
 *
 * If the user is not authorized, it responds with a 403 Forbidden error.
 */
async function verifyAuthUserOwnership(req, res, next) {
    // If the userId param is "me", assign it to the authenticated user's ID.
    if (req.params.userId === 'me') {
        req.params.userId = req.userId;
    }

    // Check if the authenticated user's ID matches the resolved userId.
    if (req.userId !== req.params.userId) {
        return res.status(httpCodes.FORBIDDEN.code).json({
            message: httpCodes.FORBIDDEN.message
        });
    }

    // Ownership confirmed; proceed to the next middleware/handler.
    next();
}

module.exports = verifyAuthUserOwnership;
