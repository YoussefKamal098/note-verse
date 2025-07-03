const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');

class ValidateVersionAccessUseCase {
    /**
     * @private
     * @type {VersionRepository}
     */
    #versionRepo;

    /**
     * @private
     * @type {ValidateNoteViewUseCase}
     */
    #validateNoteViewUseCase;

    /**
     * @param {Object} dependencies
     * @param {VersionRepository} dependencies.versionRepo
     * @param {ValidateNoteViewUseCase} dependencies.validateNoteViewUseCase
     */
    constructor({versionRepo, validateNoteViewUseCase}) {
        this.#versionRepo = versionRepo;
        this.#validateNoteViewUseCase = validateNoteViewUseCase;
    }

    /**
     * Validates access to a version and its associated note
     * @param {Object} params
     * @param {string} params.userId - Authenticated user ID
     * @param {string} params.versionId - Version ID to access
     * @returns {Promise<{version: Object, note: Object}>}
     * @throws {AppError} For authorization/validation failures
     */
    async execute({userId, versionId}) {
        try {
            // 1. Get version first
            const version = await this.#versionRepo.getVersion(versionId);
            if (!version) {
                throw new AppError(
                    statusMessages.VERSION_NOT_FOUND,
                    httpCodes.NOT_FOUND.code,
                    httpCodes.NOT_FOUND.name
                );
            }

            // 2. Validate note access using existing use case
            const note = await this.#validateNoteViewUseCase.execute({
                userId,
                noteId: version.noteId
            });

            return {version, note};
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(
                statusMessages.VERSION_ACCESS_CHECK_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = ValidateVersionAccessUseCase;
