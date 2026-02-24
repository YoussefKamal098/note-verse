const AppError = require('@/errors/app.error');
const errorFactory = require('@/errors/factory.error');

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

            // 2. ensure that version exists
            if (!version) throw errorFactory.versionNotFound();

            // 3. Validate note access using existing use case
            const note = await this.#validateNoteViewUseCase.execute({
                userId,
                noteId: version.noteId
            });

            return {version, note};
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw errorFactory.versionAccessCheckFailed();
        }
    }

}

module.exports = ValidateVersionAccessUseCase;
