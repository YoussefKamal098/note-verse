const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');
const AppError = require('../errors/app.error');
const NoteValidationService = require("../validations/note.validation");
const noteRepository = require("../repositories/note.repository");
const userService = require('../services/user.service');

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
     * @private
     * @type {NoteValidationService}
     */
    #noteValidationService;
    /**
     * @private
     * @type {UserService}
     */
    #userService;

    /**
     * Creates an instance of NoteService.
     *
     * @param {NoteRepository} noteRepository - Repository handling note database operations.
     * @param {NoteValidationService} noteValidationService - Service to validate note data.
     * @param {UserService} userService - Service for managing user-related operations.
     */
    constructor(noteRepository, noteValidationService, userService) {
        this.#noteRepository = noteRepository;
        this.#noteValidationService = noteValidationService;
        this.#userService = userService;
    }

    /**
     * Validates note data for creation or update.
     *
     * If the note is new or if a field is provided (i.e., not undefined), the corresponding
     * validation method is invoked on the NoteValidationService.
     *
     * @private
     * @param {Object} noteData - The note data to validate.
     * @param {string} noteData.title - The title of the note.
     * @param {Array} noteData.tags - The tags associated with the note.
     * @param {string} noteData.content - The content of the note.
     * @param {boolean} noteData.isPinned - Indicates if the note is pinned.
     * @param {boolean} [isNew=true] - Flag indicating if this is a new note.
     * @returns {void}
     */
    #validateNoteData({title, tags, content, isPinned}, isNew = true) {
        if (isNew || title !== undefined) {
            this.#noteValidationService.validateTitle(title);
        }
        if (isNew || tags !== undefined) {
            this.#noteValidationService.validateTags(tags);
        }
        if (isNew || content !== undefined) {
            this.#noteValidationService.validateContent(content);
        }
        if (isNew || isPinned !== undefined) {
            this.#noteValidationService.validateIsPinned(isPinned);
        }
    }

    /**
     * Ensures that a note exists for the given user by attempting to find it.
     *
     * @private
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<void>}
     * @throws {AppError} If the note does not exist or does not belong to the user.
     */
    async #ensureUserNoteExists(userId, noteId) {
        await this.findUserNoteById(userId, noteId);
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
     * @param {boolean} params.isPinned - Indicates if the note is pinned.
     * @returns {Promise<Object>} The newly created note object.
     * @throws {AppError} If note creation fails.
     */
    async create({userId, title, tags, content, isPinned} = {}) {
        await this.#userService.ensureUserExists(userId);
        this.#validateNoteData({title, tags, content, isPinned});

        try {
            return await this.#noteRepository.create({userId, title, tags, content, isPinned});
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
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Object>} The note object deep-frozen if found.
     * @throws {AppError} If the note is not found or does not belong to the user.
     */
    async findUserNoteById(userId, noteId) {
        await this.#userService.ensureUserExists(userId);
        let note;

        try {
            note = await this.#noteRepository.findById(noteId);
        } catch (error) {
            throw new AppError(
                httpCodes.INTERNAL_SERVER_ERROR.message,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        if (!note || note.userId !== userId) {
            throw new AppError(
                statusMessages.USER_NOTE_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        return note;
    }

    /**
     * Updates a user's note.
     *
     * Validates that the note exists for the user and that the provided update data is valid.
     * Delegates the update operation to the note repository.
     *
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @param {Object} updates - The fields to update.
     * @param {string} [updates.title] - The updated title of the note.
     * @param {Array} [updates.tags] - The updated tags for the note.
     * @param {string} [updates.content] - The updated content of the note.
     * @param {boolean} [updates.isPinned] - The updated pinned status.
     * @returns {Promise<Object>} The updated note object deep-frozen if found.
     * @throws {AppError} If the update operation fails.
     */
    async updateUserNote(userId, noteId, {title, tags, content, isPinned}) {
        await this.#ensureUserNoteExists(userId, noteId);
        this.#validateNoteData({title, tags, content, isPinned}, false);
        let note;

        try {
            const updates = {title, tags, content, isPinned};
            note = await this.#noteRepository.findByIdAndUpdate(noteId, updates);
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_UPDATE_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        if (!note) {
            throw new AppError(
                statusMessages.NOTE_UPDATE_FAILED,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        return note;
    }

    /**
     * Deletes a user's note by its ID.
     *
     * Ensures that the note exists for the user, then delegates deletion to the note repository.
     *
     * @param {string} userId - The ID of the user.
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Object>} The deleted note object.
     * @throws {AppError} If note deletion fails.
     */
    async deleteUserNoteById(userId, noteId) {
        await this.#ensureUserNoteExists(userId, noteId);
        let deletedNote;

        try {
            deletedNote = await this.#noteRepository.deleteById(noteId);
        } catch (error) {
            throw new AppError(
                statusMessages.NOTE_DELETION_FAILED,
                httpCodes.INTERNAL_SERVER_ERROR.code,
                httpCodes.INTERNAL_SERVER_ERROR.name
            );
        }

        if (!deletedNote) {
            throw new AppError(
                statusMessages.NOTE_DELETION_FAILED,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        return deletedNote;
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
     * @returns {Promise<Readonly<Object>>} An array of note objects.
     * @throws {AppError} If note retrieval fails.
     */
    async findUserNotes(userId, {
        searchText,
        options = {}
    } = {}) {
        await this.#userService.ensureUserExists(userId);

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

module.exports = new NoteService(noteRepository, new NoteValidationService(), userService);
