/**
 * Factory function that creates middleware to validate version access permissions
 * @module Middleware/VersionValidation
 * @param {Object} dependencies - Required dependencies
 * @param {ValidateVersionAccessUseCase} dependencies.validateVersionAccessUseCase - The use case instance
 * @returns {Function} Express middleware function that validates version access
 *
 * @example
 * // Usage in route:
 * router.get('/versions/:versionId',
 *   validateVersionAccessPermission({ validateVersionAccessUseCase }),
 *   versionsController.getVersion
 * );
 */
const validateVersionAccessPermission = ({validateVersionAccessUseCase}) => {
    /**
     * Express middleware to validate version access permissions
     * @function
     * @async
     * @param {import('express').Request} req - Express request object
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.versionId - The ID of the version to access
     * @param {string} req.userId - The authenticated user's ID
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next middleware function
     * @throws {AppError} 404 - VERSION_NOT_FOUND if version doesn't exist
     * @throws {AppError} 403 - PERMISSION_DENIED if user lacks access
     * @throws {AppError} 500 - INTERNAL_SERVER_ERROR for unexpected errors
     */
    return async (req, res, next) => {
        const {versionId} = req.params;
        const userId = req.userId;

        try {
            const {version, note} = await validateVersionAccessUseCase.execute({
                userId,
                versionId
            });

            // Attach to request for downstream use
            req.version = version;
            req.note = note;

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {validateVersionAccessPermission};
