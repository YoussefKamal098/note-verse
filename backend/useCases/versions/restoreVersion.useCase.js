const AppError = require('../../errors/app.error');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');

class RestoreNoteVersionUseCase {
    /**
     * @private
     * @type {NoteRepository}
     */
    #noteRepo;

    /**
     * @private
     * @type {VersionRepository}
     */
    #versionRepo;
    /**
     * @private
     * @type {BaseTransactionService}
     */
    #transactionService;

    /**
     * Creates an instance of CreateNoteWithInitialVersionUseCase
     * @param {Object} dependencies
     * @param {NoteRepository} dependencies.noteRepo
     * @param {VersionRepository} dependencies.versionRepo
     * @param {BaseTransactionService} dependencies.transactionService
     */
    constructor({
                    noteRepo,
                    versionRepo,
                    transactionService
                }) {
        this.#noteRepo = noteRepo;
        this.#versionRepo = versionRepo;
        this.#transactionService = transactionService;
    }

    /**
     * Restores a note to a specific version and updates note content
     * @param {Object} params
     * @param {string} params.userId - User performing the restore
     * @param {string} params.versionId - Version ID to restore to
     * @returns {Promise<{note: Object, version: Object}>} Restored note and new version record
     * @throws {AppError} When restore operation fails
     */
    async execute({userId, versionId}) {
        return this.#transactionService.executeTransaction(
            async (session) => {
                // 1. Get version first
                const version = await this.#versionRepo.getVersion(versionId, {session});
                if (!version) {
                    throw new AppError(
                        statusMessages.VERSION_NOT_FOUND,
                        httpCodes.NOT_FOUND.code,
                        httpCodes.NOT_FOUND.name
                    );
                }

                const note = await this.#noteRepo.findById(
                    version?.noteId,
                    session
                );

                if (!note) {
                    throw new AppError(
                        statusMessages.NOTE_NOT_FOUND,
                        httpCodes.NOT_FOUND.code,
                        httpCodes.NOT_FOUND.name
                    );
                }

                if (note.userId !== userId) {
                    throw new AppError(
                        statusMessages.NOTE_OWNER_REQUIRED,
                        httpCodes.FORBIDDEN.code,
                        httpCodes.FORBIDDEN.name
                    )
                }

                // 2. Create restoration version record
                const restoreResult = await this.#versionRepo.restoreVersion({
                    versionId,
                    userId
                }, {session});

                if (!restoreResult) {
                    throw new AppError(
                        statusMessages.VERSION_NOT_FOUND,
                        httpCodes.NOT_FOUND.code,
                        httpCodes.NOT_FOUND.name
                    );
                }

                const restoredVersion = restoreResult.version;
                if (!restoredVersion) {
                    throw new AppError(
                        statusMessages.VERSION_ALREADY_CURRENT,
                        httpCodes.CONFLICT.code,
                        httpCodes.CONFLICT.name
                    );
                }

                const updatedNote = await this.#noteRepo.findByIdAndUpdate(
                    version?.noteId,
                    {content: restoreResult.content},
                    session
                );

                if (!updatedNote) {
                    throw new AppError(
                        statusMessages.NOTE_NOT_FOUND,
                        httpCodes.NOT_FOUND.code,
                        httpCodes.NOT_FOUND.name
                    );
                }

                return {version: restoredVersion, note: updatedNote};
            },
            {
                message: statusMessages.VERSION_RESTORE_FAILED,
                conflictMessage: statusMessages.VERSION_RESTORE_CONFLICT
            }
        );
    }
}

module.exports = RestoreNoteVersionUseCase;
