const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const roles = require('../../enums/roles.enum');
const resources = require('../../enums/resources.enum');

class ValidateNoteViewUseCase {
    /**
     * @private
     * @type {NoteRepository}
     */
    #noteRepo;

    /**
     * @private
     * @type {PermissionRepository}
     */
    #permissionRepo;

    /**
     * @param {Object} dependencies
     * @param {NoteRepository} dependencies.noteRepo
     * @param {PermissionRepository} dependencies.permissionRepo
     */
    constructor({noteRepo, permissionRepo}) {
        this.#noteRepo = noteRepo;
        this.#permissionRepo = permissionRepo;
    }

    /**
     * Validates if user can view the note
     * @param {Object} params
     * @param {string} params.userId - Authenticated user ID
     * @param {string} params.noteId - Note ID to view
     * @returns {Promise<Readonly<Object>>} Note Object if authorized
     * @throws {AppError} For authorization failures
     */
    async execute({userId, noteId}) {
        try {
            const [note, permission] = await Promise.all([
                this.#noteRepo.findById(noteId),
                this.#permissionRepo.getUserPermission({
                    userId,
                    resourceType: resources.NOTE,
                    resourceId: noteId
                })
            ]);

            // Note existence check
            if (!note) {
                throw new AppError(
                    statusMessages.NOTE_NOT_FOUND,
                    httpCodes.NOT_FOUND.code,
                    httpCodes.NOT_FOUND.name
                );
            }

            // Check note access, Permission-based access
            if (this.#isOwner({userId, note, permission}) ||
                this.#canView({userId, note, permission})) {
                return note;
            }

            throw new AppError(
                httpCodes.FORBIDDEN.message,
                httpCodes.FORBIDDEN.code,
                httpCodes.FORBIDDEN.name
            );
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                statusMessages.NOTE_ACCESS_CHECK_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Determines if user is the owner
     * @param {Object} params
     * @param {string} params.userId
     * @param {Object} params.note
     * @param {Object|null} params.permission
     * @returns {boolean}
     */
    #isOwner({userId, note, permission}) {
        return note.userId === userId || permission?.role === roles.OWNER;
    }

    /**
     * Determines if can view
     * @param {Object} params
     * @param {string} params.userId
     * @param {Object} params.note
     * @param {Object|null} params.permission
     * @returns {boolean}
     */
    #canView({userId, note, permission}) {
        return note.userId === userId || ([roles.EDITOR, roles.VIEWER].includes(permission?.role));
    }
}

module.exports = ValidateNoteViewUseCase;
