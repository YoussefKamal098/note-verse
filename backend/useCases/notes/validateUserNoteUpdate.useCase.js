const statusMessages = require('@/constants/statusMessages');
const resources = require('@/enums/resources.enum');
const noteUpdateByRoleSchema = require("@/schemas/noteUpdateByRole.schema");
const errorFactory = require('@/errors/factory.error');
const {canEdit} = require("@/utils/roles.utils");

class ValidateUserNoteUpdateUseCase {
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
     * @private
     * @type {BaseTransactionService}
     */
    #transactionService;

    /**
     * @private
     * @type {ValidateUserNoteUpdateUseCase}
     */

    /**
     * Creates an instance of UpdateNoteUseCase.
     * @param {Object} dependencies - Injected dependencies
     * @param {NoteRepository} dependencies.noteRepo - Note repository
     * @param {PermissionRepository} dependencies.permissionRepo - Permission repository
     * @param {BaseTransactionService} dependencies.transactionService - Transaction service
     */
    constructor({noteRepo, permissionRepo, transactionService}) {
        this.#noteRepo = noteRepo;
        this.#permissionRepo = permissionRepo;
        this.#transactionService = transactionService;
    }

    /**
     * Validates note update permissions with optional data check skip
     * @param {Object} params
     * @param {string} params.userId - Authenticated user ID
     * @param {string} params.noteId - Note ID to update
     * @param {string} [params.commitMessage]  - Version message/description
     * @param {Object} [params.updateData] - Required unless skipDataCheck=true
     * @param {Object} [options]
     * @param {boolean} [options.skipDataCheck=false] - Skip note fetch, just validate role
     * @param {Object} [options.session] - Database session
     * @returns {Promise<{note:OutputNote, userRole:UserRoleType}|null>} note that will be updated
     * @throws {AppError} For validation errors
     */
    async execute({userId, noteId, commitMessage, updateData}, {skipDataCheck = false, session = null} = {}) {
        const validateFn = async (session) => {
            const permission = await this.#permissionRepo.getUserPermission({
                userId,
                resourceType: resources.NOTE,
                resourceId: noteId
            }, session);

            // Permission existence check
            if (!permission) throw errorFactory.noteEditDenied();

            const note = await this.#noteRepo.findById(noteId, {session, role: permission.role});
            if (!note) throw errorFactory.noteNotFound();

            // Check note access, Permission-based access
            canEdit(permission.role, {
                throwOnDenied: true,
                errorMessage: statusMessages.NOTE_EDIT_DENIED
            });

            if (skipDataCheck) return note;

            // Full validation
            this.#validateUpdateData(permission.role, commitMessage, updateData);
            return {note, userRole: permission.role};
        };

        // Use transaction if no session provided
        return session ? await validateFn(session)
            : await this.#transactionService.executeTransaction(validateFn);
    }

    #validateUpdateData(role, commitMessage, updateData) {
        const {error} = noteUpdateByRoleSchema[role].validate({...updateData, commitMessage}, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            throw errorFactory.forbidden(error.details.map(d => d.message).join('; '));
        }
    }
}

module.exports = ValidateUserNoteUpdateUseCase;
