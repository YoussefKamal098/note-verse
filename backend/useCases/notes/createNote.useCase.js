const statusMessages = require('../../constants/statusMessages');

class CreateNoteUseCase {
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
    constructor({noteRepo, versionRepo, transactionService}) {
        this.#noteRepo = noteRepo;
        this.#versionRepo = versionRepo;
        this.#transactionService = transactionService;
    }

    /**
     * Creates a new note with initial version
     * @param {Object} noteData - The data for the new note.
     * @param {string} noteData.userId - The ID of the user creating the note.
     * @param {string} noteData.title - The title of the note.
     * @param {Array<string>} noteData.tags - An array of tags associated with the note.
     * @param {string} noteData.content - The content of the note.
     * @param {boolean} [noteData.isPinned] - The pinned status.
     * @param {boolean} [noteData.isPublic] - The public accessibility
     * @returns {Promise<Readonly<Object>>} Created note
     * @throws {AppError} When creation fails
     */
    async execute({userId, title, content, tags, isPinned, isPublic}) {
        return this.#transactionService.executeTransaction(
            async (session) => {
                // 1. Create the note
                const note = await this.#noteRepo.create({
                    userId,
                    title,
                    tags,
                    content,
                    isPinned,
                    isPublic
                }, session);

                // 2. Create initial version
                await this.#versionRepo.createVersion({
                    noteId: note.id,
                    oldContent: '',
                    newContent: content,
                    userId,
                    message: "Initial version"
                }, {session});

                return note;
            }, {message: statusMessages.NOTE_CREATION_FAILED});
    }
}

module.exports = CreateNoteUseCase;
