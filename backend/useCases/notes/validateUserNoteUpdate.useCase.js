const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const resources = require('../../enums/resources.enum');
const noteUpdateByRoleSchema = require("../../schemas/noteUpdateByRole.schema");
const roles = require("../../enums/roles.enum");

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
     * @returns {Promise<Object|null>} note that will be updated
     * @throws {AppError} For validation errors
     */
    async execute({userId, noteId, commitMessage, updateData}, {skipDataCheck = false, session = null} = {}) {
        const validateFn = async (session) => {
            const note = await this.#noteRepo.findById(noteId, session);
            const permission = await this.#permissionRepo.getUserPermission({
                userId,
                resourceType: resources.NOTE,
                resourceId: noteId
            }, session);

            if (!note) {
                throw new AppError(
                    statusMessages.NOTE_NOT_FOUND,
                    httpCodes.NOT_FOUND.code,
                    httpCodes.NOT_FOUND.name
                );
            }

            if (skipDataCheck) {
                // Fast path - only check role
                this.#validateBasicRole(permission?.role);
                return note;
            }

            // Full validation
            this.#validateFullUpdate({note, userId, commitMessage, permission, updateData});
            return note;
        };

        // Use transaction if no session provided
        return session
            ? await validateFn(session)
            : await this.#transactionService.executeTransaction(validateFn);
    }

    #validateBasicRole(role) {
        if (![roles.OWNER, roles.EDITOR].includes(role)) {
            throw new AppError(
                statusMessages.PERMISSION_DENIED,
                httpCodes.FORBIDDEN.code,
                httpCodes.FORBIDDEN.name
            );
        }
    }

    #validateFullUpdate({note, userId, commitMessage, permission, updateData}) {
        const userRole = this.#isOwner({userId, note, permission})
            ? roles.OWNER
            : permission?.role;

        this.#validateUpdateData(userRole, commitMessage, updateData);
    }

    #validateUpdateData(role, commitMessage, updateData) {
        const {error} = noteUpdateByRoleSchema[role].validate({...updateData, commitMessage}, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            throw new AppError(
                error.details.map(d => d.message).join('; '),
                httpCodes.FORBIDDEN.code,
                httpCodes.FORBIDDEN.name
            );
        }
    }

    #isOwner({userId, note, permission}) {
        return note.userId === userId || permission?.role === roles.OWNER;
    }
}

module.exports = ValidateUserNoteUpdateUseCase;
