const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

/**
 * Factory function that creates middleware to validate note view permissions
 * @module Middleware/NoteValidation
 * @param {Object} dependencies - Required dependencies
 * @param {ValidateNoteViewUseCase} dependencies.validateNoteViewUseCase - The use case instance for validating note views
 * @returns {Function} Function that accepts options and returns Express middleware
 *
 * @example
 * // Basic usage (default noteId in params)
 * router.get('/:noteId',
 *   validateNoteViewPermission({ validateNoteViewUseCase })(),
 *   notesController.findNoteById
 * );
 *
 * // Custom note ID location
 * router.post('/view',
 *   validateNoteViewPermission({ validateNoteViewUseCase })({
 *     noteIdLocation: 'body',
 *     noteIdField: 'targetNoteId'
 *   }),
 *   notesController.findNoteById
 * );
 */
const validateNoteViewPermission = ({validateNoteViewUseCase}) => {
    /**
     * Options configuration
     * @param {Object} [options] - Configuration options
     * @param {string} [options.noteIdField='noteId'] - Name of the note ID field
     * @param {string} [options.noteIdLocation='params'] - Where to find note ID ('params', 'body', or 'query')
     * @returns {Function} Express middleware function
     */
    return (options = {}) => {
        const {
            noteIdField = 'noteId',
            noteIdLocation = 'params'
        } = options;

        /**
         * Express middleware to validate note viewing permissions
         * @function
         * @async
         * @param {import('express').Request} req - Express request object
         * @param {import('express').Response} res - Express response object
         * @param {import('express').NextFunction} next - Express next middleware function
         * @throws {AppError} 404 - NOTE_NOT_FOUND if the note doesn't exist
         * @throws {AppError} 403 - PERMISSION_DENIED if user lacks view permissions
         * @throws {AppError} 500 - INTERNAL_SERVER_ERROR for unexpected errors
         */
        return async (req, res, next) => {
            const userId = req.userId;
            const noteId = req[noteIdLocation]?.[noteIdField];

            if (!userId || !noteId) {
                return next(new AppError(
                    httpCodes.BAD_REQUEST.message,
                    httpCodes.BAD_REQUEST.code,
                    httpCodes.BAD_REQUEST.name
                ));
            }

            try {
                req.note = await validateNoteViewUseCase.execute({userId, noteId});
                next();
            } catch (error) {
                next(error);
            }
        };
    };
};

/**
 * Creates a note ownership validator middleware factory
 * @function validateNoteOwnership
 * @param {Object} dependencies - Required services
 * @param {NoteService} dependencies.noteService - Required services
 * @returns {Function} Configured middleware factory function
 *
 * @example
 * // Basic setup
 * const validator = createNoteOwnershipValidator({ noteService });
 */
const validateNoteOwnership = ({noteService}) => {
    /**
     * Creates configured middleware instances
     * @param {Object} [options] - Configuration options
     * @param {string} options.noteIdName - noteId field name
     * @param {string[]} options.loactions - noteId location, ('params', 'query', 'body')
     * @returns {Function} Configured middleware function
     *
     * @example
     * // Creates validator that checks req.query.id
     * const queryValidator = validator({
     *   noteIdName: 'id',
     *   locations: ['query']
     * });
     */
    return (options = {}) => {
        const {
            noteIdName = 'noteId',
            locations = ['params', 'query', 'body']
        } = options;

        return async (req, res, next) => {
            try {
                // 1. Locate note ID
                let noteId = null;
                for (const location of locations) {
                    if (req[location]?.[noteIdName] !== undefined) {
                        noteId = req[location][noteIdName];
                        break;
                    }
                }
                if (!noteId) {
                    throw new AppError(
                        statusMessages.NOTE_NOT_FOUND,
                        httpCodes.BAD_REQUEST.code,
                        httpCodes.BAD_REQUEST.name
                    );
                }

                // 2. Verify ownership
                const note = await noteService.findNoteById(noteId);
                if (!note) {
                    throw new AppError(
                        statusMessages.NOTE_NOT_FOUND,
                        httpCodes.NOT_FOUND.code,
                        httpCodes.NOT_FOUND.name
                    );
                }

                if (note.userId !== req.userId) {
                    throw new AppError(
                        statusMessages.NOTE_OWNER_REQUIRED,
                        httpCodes.FORBIDDEN.code,
                        httpCodes.FORBIDDEN.name
                    );
                }

                // 3. Attach to request
                req.note = note;
                next();
            } catch (error) {
                next(error);
            }
        };
    };
};
module.exports = {
    validateNoteViewPermission,
    validateNoteOwnership
};
