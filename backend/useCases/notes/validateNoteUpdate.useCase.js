const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const resources = require('../../enums/resources.enum');
const noteUpdateByRoleSchema = require("../../schemas/noteUpdateByRole.schema");
const roles = require("../../enums/roles.enum");

class ValidateNoteUpdateUseCase {
    /**
     * @private
     * @type {import('../repositories/note.repository').NoteRepository}
     */
    #noteRepo;

    /**
     * @private
     * @type {import('../repositories/permission.repository').PermissionRepository}
     */
    #permissionRepo;

    /**
     * @private
     * @type {import('../unit-of-work/uow.interface').IUnitOfWork}
     */
    #uow;

    /**
     * Creates an instance of ValidateNoteUpdateUseCase.
     * @param {Object} dependencies - Injected dependencies
     * @param {NoteRepository} dependencies.noteRepo - Note repository
     * @param {PermissionRepository} dependencies.permissionRepo - Permission repository
     * @param {IUnitOfWork} dependencies.uow - Unit of Work for transactions
     */
    constructor({noteRepo, permissionRepo, uow}) {
        this.#noteRepo = noteRepo;
        this.#permissionRepo = permissionRepo;
        this.#uow = uow;
    }

    /**
     * Validates and sanitizes note update based on user permissions
     * @param {Object} params
     * @param {string} params.userId - Authenticated user ID
     * @param {string} params.noteId - Note ID to update
     * @param {Object} params.updateData - Raw update data from request
     * @returns {Promise<Object>} Sanitized update data or null if unauthorized
     * @throws {AppError} For validation errors or system failures
     */
    async execute({userId, noteId, updateData}) {
        const session = await this.#uow.begin();
        try {
            // validation sequence
            const note = await this.#noteRepo.findById(noteId, session);
            const permission = await this.#permissionRepo.getUserPermission({
                userId,
                resourceType: resources.NOTE,
                resourceId: noteId
            }, session)

            // Resource validation
            if (!note) {
                await this.#uow.rollback(session);
                throw new AppError(
                    statusMessages.NOTE_NOT_FOUND,
                    httpCodes.NOT_FOUND.code,
                    httpCodes.NOT_FOUND.name
                );
            }

            const userRole = this.#isOwner({userId, note, permission}) ? roles.OWNER : permission?.role;
            const validationResult = this.#validateUpdate(userRole, updateData);

            if (!validationResult.valid) {
                await this.#uow.rollback(session);
                throw new AppError(
                    statusMessages.USER_NOTE_UPDATE_FORBIDDEN,
                    httpCodes.FORBIDDEN.code,
                    httpCodes.FORBIDDEN.name
                );
            }

            // Commit validation transaction
            await this.#uow.commit(session);
            return validationResult.data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            await this.#uow.rollback(session);
            throw new AppError(
                statusMessages.NOTE_UPDATE_VALIDATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Validates update data based on user role
     * @private
     */
    #validateUpdate(role, updateData) {
        const {error, value} = noteUpdateByRoleSchema[role].validate(updateData, {
            abortEarly: false,
            stripUnknown: true
        });

        return {
            valid: !error,
            data: value,
            message: error?.details.map(d => d.message).join('; ')
        };
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
}

module.exports = ValidateNoteUpdateUseCase;
