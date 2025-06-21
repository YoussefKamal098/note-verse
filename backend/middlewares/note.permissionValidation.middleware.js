const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

/**
 * Factory function that creates middleware to validate note update permissions and data
 * @module Middleware/NoteValidation
 * @param {Object} dependencies - Required dependencies
 * @param {ValidateNoteUpdateUseCase} dependencies.validateNoteUpdateUseCase - The use case instance for validating note updates
 * @returns {Function} Express middleware function that validates note update permissions and data
 *
 * @example
 * // Usage in route:
 * router.patch('/:noteId',
 *   validateNoteUpdatePermission({ validateNoteUpdateUseCase }),
 *   notesController.updateNoteById
 * );
 */
const validateNoteUpdatePermission = ({validateNoteUpdateUseCase}) => {
    /**
     * Express middleware to validate note update permissions and sanitize input
     * @function
     * @async
     * @param {import('express').Request} req - Express request object
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.noteId - The ID of the note to update
     * @param {string} req.userId - The authenticated user's ID
     * @param {Object} req.body - The update data payload
     * @param {string} [req.body.title] - New title for the note
     * @param {string[]} [req.body.tags] - New tags for the note
     * @param {string} [req.body.content] - New content for the note
     * @param {boolean} [req.body.isPinned] - New pinned status for the note
     * @param {boolean} [req.body.isPublic] - New visibility status for the note
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next middleware function
     * @throws {AppError} 404 - NOTE_NOT_FOUND if the note doesn't exist
     * @throws {AppError} 403 - PERMISSION_DENIED if user lacks update permissions
     * @throws {AppError} 400 - VALIDATION_ERROR if update data fails validation
     * @throws {AppError} 500 - INTERNAL_SERVER_ERROR for unexpected errors
     */
    return async (req, res, next) => {
        const {noteId} = req.params;
        const userId = req.userId;
        const updateData = req.body;

        try {
            req.body = await validateNoteUpdateUseCase.execute({
                userId,
                noteId,
                updateData
            });
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Factory function that creates middleware to validate note view permissions
 * @module Middleware/NoteValidation
 * @param {Object} dependencies - Required dependencies
 * @param {import('../use-cases/validate-note-view.use-case')} dependencies.validateNoteViewUseCase - The use case instance for validating note views
 * @returns {Function} Express middleware function that validates note view permissions
 *
 * @example
 * // Usage in route:
 * router.get('/:noteId',
 *   validateNoteViewPermission({ validateNoteViewUseCase }),
 *   notesController.findNoteById
 * );
 */
const validateNoteViewPermission = ({validateNoteViewUseCase}) => {
    /**
     * Express middleware to validate note viewing permissions
     * @function
     * @async
     * @param {import('express').Request} req - Express request object
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.noteId - The ID of the note to view
     * @param {string} req.userId - The authenticated user's ID
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next middleware function
     * @throws {AppError} 404 - NOTE_NOT_FOUND if the note doesn't exist
     * @throws {AppError} 403 - PERMISSION_DENIED if user lacks view permissions
     * @throws {AppError} 500 - INTERNAL_SERVER_ERROR for unexpected errors
     */
    return async (req, res, next) => {
        const {noteId} = req.params;
        const userId = req.userId;

        try {
            req.note = await validateNoteViewUseCase.execute({userId, noteId});
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Factory function that creates middleware to validate note ownership
 * @module Middleware/NoteValidation
 * @param {Object} dependencies - Required dependencies
 * @param {import('../services/note.service')} dependencies.noteService - The note service instance
 * @returns {Function} Express middleware function that validates note ownership
 *
 * @example
 * // Usage in route:
 * router.delete('/:noteId',
 *   validateNoteOwnership({ noteService }),
 *   notesController.deleteNoteById
 * );
 */
const validateNoteOwnership = ({noteService}) => {
    /**
     * Express middleware to validate note ownership
     * @function
     * @async
     * @param {import('express').Request} req - Express request object
     * @param {Object} req.params - Route parameters
     * @param {string} req.params.noteId - The ID of the note to verify ownership
     * @param {string} req.userId - The authenticated user's ID
     * @param {import('express').Response} res - Express response object
     * @param {import('express').NextFunction} next - Express next middleware function
     * @throws {AppError} 404 - NOTE_NOT_FOUND if the note doesn't exist
     * @throws {AppError} 403 - NOTE_OWNER_REQUIRED if user is not the note owner
     * @throws {AppError} 500 - INTERNAL_SERVER_ERROR for unexpected errors
     */
    return async (req, res, next) => {
        try {
            const {noteId} = req.params;
            const userId = req.userId;

            const note = await noteService.findNoteById(noteId);

            if (!note || note.userId !== userId) {
                return next(new AppError(
                    statusMessages.NOTE_OWNER_REQUIRED,
                    httpCodes.FORBIDDEN.code
                ));
            }

            req.note = note;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    validateNoteUpdatePermission,
    validateNoteViewPermission,
    validateNoteOwnership
};
