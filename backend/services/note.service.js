const statusMessages = require('@/constants/statusMessages');
const AppError = require('@/errors/app.error');
const {internalServerError} = require("@/errors/factory.error");

/**
 * Service for managing user notes.
 *
 * This service handles operations related to creating, retrieving, updating, and deleting user notes.
 * It ensures that the associated user exists, validates note data using the NoteValidationService,
 * and delegates data operations to the note repository.
 *
 * @class NoteService
 */
class NoteService {
    /**
     * @private
     * @type {NoteRepository}
     */
    #noteRepo;
    /**
     * @private
     * @type {NoteSearchService}
     */
    #noteSearchService;

    /**
     * Creates an instance of NoteService.
     *
     * @param {NoteRepository} noteRepo - Repository handling note database operations.
     * @param {NoteSearchService} noteSearchService - The new search service
     */
    constructor({noteRepo, noteSearchService}) {
        this.#noteRepo = noteRepo;
        this.#noteSearchService = noteSearchService;
    }

    /**
     * Creates a new note for a user.
     *
     * Validates that the user exists and that the note data is valid; then delegates note creation
     * to the note repository.
     *
     * @param {Object} params - The note creation parameters.
     * @param {string} params.userId - The ID of the user.
     * @param {string} params.title - The title of the note.
     * @param {Array} params.tags - The tags associated with the note.
     * @param {string} params.content - The content of the note.
     * @param {boolean} [params.isPinned] - The pinned status.
     * @param {boolean} [params.isPublic] - The public accessibility
     * @returns {Promise<Readonly<Object>>} The newly created note object.
     * @throws {AppError} If note creation fails.
     */
    async create({userId, title, tags, content, isPinned = false, isPublic = false} = {}) {
        try {
            return await this.#noteRepo.create({userId, title, tags, content, isPinned, isPublic});
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw internalServerError(statusMessages.NOTE_CREATION_FAILED);
        }
    }

    /**
     * Retrieves a note by its ID for a specific user.
     *
     * Ensures that the user exists and that the note belongs to the user.
     *
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Readonly<Object || null>>} The note object deep-frozen if found.
     * @throws {AppError} If the retrieval operation fails.
     */
    async findNoteById(noteId) {
        try {
            return await this.#noteRepo.findById(noteId);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw internalServerError();
        }
    }

    /**
     * Updates a user's note.
     *
     * Validates that the note exists for the user and that the provided update data is valid.
     * Delegates the update operation to the note repository.
     *
     * @param {string} noteId - The ID of the note.
     * @param {Object} updates - The fields to update.
     * @param {string} [updates.title] - The updated title of the note.
     * @param {Array} [updates.tags] - The updated tags for the note.
     * @param {string} [updates.content] - The updated content of the note.
     * @param {boolean} [updates.isPinned] - The updated pinned status.
     * @param {boolean} [updates.isPublic] - The updated public accessibility
     * @returns {Promise<Readonly<Object || null>>} The updated note object deep-frozen if found.
     * @throws {AppError} If the update operation fails.
     */
    async updateNoteById(noteId, {title, tags, content, isPinned, isPublic}) {
        try {
            const updates = {title, tags, content, isPinned, isPublic};
            return await this.#noteRepo.findByIdAndUpdate(noteId, updates);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw internalServerError(statusMessages.NOTE_UPDATE_FAILED);
        }
    }

    /**
     * Deletes a user's note by its ID.
     *
     * Ensures that the note exists for the user, then delegates deletion to the note repository.
     *
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Readonly<Object || null>>} The deleted note deep-frozen object or null if not found.
     * @throws {AppError} If note deletion fails.
     */
    async deleteNoteById(noteId) {
        try {
            return await this.#noteRepo.deleteById(noteId);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw internalServerError(statusMessages.NOTE_DELETION_FAILED);
        }
    }

    /**
     * Retrieves notes for a specific user with optional search and pagination.
     * Integrates NoteSearchService for full-text capabilities or falls back to repository find.
     *
     * @param {string} userId - The ID of the owner of the notes.
     * @param {Object} [params] - The search and filtering parameters.
     * @param {string} [params.searchText] - The text query for fuzzy search.
     * @param {Object} [params.options] - Configuration for pagination and sorting.
     * @param {number} [options.limit=10] - Number of records per page.
     * @param {string|null} [options.cursor=null] - Atlas Search sequence token for next page.
     * @returns {Promise<import('./NoteSearchService').SearchResult>} A paginated search result object.
     * @throws {AppError} If note retrieval or search operation fails.
     */
    async findUserNotes(userId, {
        searchText,
        options = {}
    } = {}) {
        try {
            const {
                limit = 10,
                cursor = null
            } = options;

            return await this.#noteSearchService.search(
                searchText,
                {userId}, // Filters to this user's notes
                {
                    limit,
                    cursor,
                    sortKey: 'pinned'
                }
            );
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw internalServerError(statusMessages.NOTES_FETCH_FAILED);
        }
    }
}

module.exports = NoteService;
