const statusMessages = require('@/constants/statusMessages');
const errorFactory = require('@/errors/factory.error');

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
        return this.#transactionService.executeTransaction(async (session) => {
                // 1. Get version first
                const version = await this.#versionRepo.getVersion(versionId, {session});
                if (!version) throw errorFactory.versionNotFound();

                const note = await this.#noteRepo.findById(version?.noteId, {session});
                if (!note) throw errorFactory.noteNotFound();

                if (note.userId !== userId) throw errorFactory.noteOwnerRequired();

                // 2. Create restoration version record
                const restoreResult = await this.#versionRepo.restoreVersion({
                    versionId,
                    userId
                }, {session});

                const restoredVersion = restoreResult.version;
                if (!restoredVersion) throw errorFactory.versionAlreadyCurrent();

                const updatedNote = await this.#noteRepo.findByIdAndUpdate(
                    version?.noteId,
                    {content: restoreResult.content},
                    {session}
                );

                return {version: restoredVersion, note: updatedNote};
            }, {
                message: statusMessages.VERSION_RESTORE_FAILED,
                conflictMessage: statusMessages.VERSION_RESTORE_CONFLICT
            }
        );
    }
}

module.exports = RestoreNoteVersionUseCase;
