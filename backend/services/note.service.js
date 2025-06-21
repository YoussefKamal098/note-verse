const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');

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
    #noteRepository;

    /**
     * Creates an instance of NoteService.
     *
     * @param {NoteRepository} noteRepository - Repository handling note database operations.
     */
    constructor(noteRepository) {
        this.#noteRepository = noteRepository;
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
            return await this.#noteRepository.create({userId, title, tags, content, isPinned, isPublic});
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_CREATION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
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
            return await this.#noteRepository.findById(noteId);
        } catch (error) {
            throw new AppError(
                httpCodes.INTERNAL_SERVER_ERROR.message,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
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
            return await this.#noteRepository.findByIdAndUpdate(noteId, updates);
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
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
            return await this.#noteRepository.deleteById(noteId);
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_DELETION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }

    /**
     * Retrieves notes for a specific user with optional search and pagination.
     *
     * Ensures that the user exists and applies default pagination options if none are provided.
     * If searchText is provided, delegates to a search method; otherwise, retrieves notes normally.
     *
     * @param {string} userId - The ID of the user.
     * @param {Object} [params={}] - Parameters for fetching notes.
     * @param {string} [params.searchText] - Text to search for within notes.
     * @param {number} [options.page=1] - The page number to retrieve (1-based).
     * @param {number} [options.perPage=10] - Number of results per page.
     * @param {Object} [options.sort={isPinned: 1, createdAt: -1, updatedAt: -1}] - Sort criteria.
     * @returns {Promise<Readonly<Object>>} An object containing the paginated results.
     * @throws {AppError} If note retrieval fails.
     */
    async findUserNotes(userId, {
        searchText,
        options = {}
    } = {}) {
        try {
            const {
                page,
                perPage,
                sort
            } = options;

            return await this.#noteRepository.find({searchText, query: {userId}, options: {page, perPage, sort}});
        } catch (error) {
            throw new AppError(
                statusMessages.NOTES_FETCH_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }
    }
}

module.exports = NoteService;
