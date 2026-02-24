const AppError = require('@/errors/app.error');
const statusMessages = require('@/constants/statusMessages');
const resources = require('@/enums/resources.enum');
const errorFactory = require('@/errors/factory.error');
const {canView} = require("@/utils/roles.utils");

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
     * @returns {Promise<Readonly<OutputNote>>} Note Object if authorized
     * @throws {AppError} For authorization failures
     */
    async execute({userId, noteId}) {
        try {
            const permission = await this.#permissionRepo.getUserPermission({
                userId,
                resourceType: resources.NOTE,
                resourceId: noteId
            });

            // Permission existence check
            if (!permission) throw errorFactory.noteViewDenied();

            // Check note access, Permission-based access
            canView(permission.role, {
                throwOnDenied: true,
                errorMessage: statusMessages.NOTE_VIEW_DENIED
            });

            const note = await this.#noteRepo.findById(noteId, {role: permission.role});

            if (!note) throw errorFactory.noteNotFound();
            return note;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw errorFactory.noteAccessCheckFailed();
        }
    }
}

module.exports = ValidateNoteViewUseCase;
