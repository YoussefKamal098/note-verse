const statusMessages = require('../../constants/statusMessages');
const NotificationType = require('@/enums/notifications.enum');

class UpdateNoteUseCase {
    /**
     * @private
     * @type {NoteRepository}
     */
    #noteRepo;
    /**
     * @private
     * @type {VersionRepository}
     */
    #versionRepo
    /**
     * @private
     * @type {BaseTransactionService}
     */
    #transactionService;
    /**
     * @private
     * @type {ValidateUserNoteUpdateUseCase}
     */
    #validator
    /**
     * @private
     * @type {NotificationBatcher}
     */
    #notificationBatcher;

    /**
     * Creates an instance of UpdateNoteUseCase.
     * @param {Object} dependencies - Injected dependencies
     * @param {NoteRepository} dependencies.noteRepo - Note repository
     * @param {VersionRepository} dependencies.versionRepo - Version repository
     * @param {BaseTransactionService} dependencies.transactionService - Transaction service
     * @param {ValidateUserNoteUpdateUseCase} dependencies.validateUserNoteUpdateUseCase - validate note update use case
     * @param {NotificationBatcher} dependencies.notificationBatcher - Notification batcher
     */
    constructor({
                    noteRepo,
                    versionRepo,
                    transactionService,
                    validateUserNoteUpdateUseCase,
                    notificationBatcher,
                }) {
        this.#noteRepo = noteRepo;
        this.#versionRepo = versionRepo;
        this.#transactionService = transactionService;
        this.#notificationBatcher = notificationBatcher;
        this.#validator = validateUserNoteUpdateUseCase;
    }

    /**
     * Validates permissions, updates note, and creates version history in a single transaction
     * @param {Object} params
     * @param {string} params.userId - Authenticated user ID
     * @param {string} params.noteId - Note ID to update
     * @param {string} [params.commitMessage]  - Version message/description
     * @param {Object} params.updateData - Raw update data from request
     * @returns {Promise<{note: Object, version: Object}>} Updated note and created version (if content changed)
     * @throws {AppError} For validation errors or system failures
     */
    async execute({userId, noteId, commitMessage, updateData = {}}) {
        return this.#transactionService.executeTransaction(
            async (session) => {
                // 1. Validate using the validator (with existing session)
                const oldNote = await this.#validator.execute(
                    {userId, noteId, commitMessage, updateData},
                    {session}
                );

                // 2. Create version if content changed
                const version = await this.#maybeCreateVersion({
                    oldNote,
                    noteId,
                    userId,
                    commitMessage,
                    updateData,
                    session
                });

                // 3. Update the note
                const updatedNote = await this.#noteRepo.findByIdAndUpdate(
                    noteId,
                    updateData,
                    session
                );

                if (updatedNote && updatedNote.userId !== userId) {
                    await this.#notificationBatcher.add({
                        recipient: updatedNote.userId,
                        type: NotificationType.NOTE_UPDATE,
                        payload: {
                            noteId,
                            userId,
                            versionId: version?.id
                        },
                    });
                }

                return {note: updatedNote, version};
            }, {
                message: statusMessages.NOTE_UPDATE_FAILED,
                conflictMessage: statusMessages.VERSION_CONFLICT,
            }
        );
    }

    async #maybeCreateVersion({oldNote, noteId, userId, commitMessage, updateData, session}) {
        if (updateData.content && this.#isContentChanged(oldNote.content, updateData.content)) {
            return await this.#versionRepo.createVersion({
                noteId,
                oldContent: oldNote.content,
                newContent: updateData.content,
                userId,
                message: commitMessage
            }, {session});
        }
        return null;
    }

    #isContentChanged(oldContent, newContent) {
        return oldContent !== newContent;
    }
}

module.exports = UpdateNoteUseCase;
