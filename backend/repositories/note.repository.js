const PaginatorService = require("../services/paginator.service");
const Note = require("../models/note.model");
const {sanitizeString} = require('shared-utils/string.utils');
const {isValidObjectId, convertToObjectId, sanitizeMongoObject} = require('../utils/obj.utils');
const {deepFreeze} = require('shared-utils/obj.utils');

/**
 * Repository for managing Note documents in the database.
 *
 * This class encapsulates CRUD operations for notes including creation, updating,
 * deletion, retrieval, and text-based search with pagination support.
 * It leverages a PaginatorService instance to paginate query results.
 *
 * @class NoteRepository
 */
class NoteRepository {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model used for note operations.
     */
    #model;
    /**
     * @private
     * @type {PaginatorService}
     * @description Service instance for handling pagination of note results.
     */
    #paginator;

    /**
     * Creates an instance of NoteRepository.
     *
     * @param {import('mongoose').Model} model - The Mongoose model for notes.
     */
    constructor(model) {
        this.#model = model;
        this.#paginator = new PaginatorService(model, {});
    }

    /**
     * Sanitizes a note MongoDB object.
     *
     * Converts internal fields and ensures the userId is returned as a string.
     *
     * @private
     * @param {Object} note - The note object retrieved from MongoDB.
     * @returns {Object} The sanitized note object.
     */
    #sanitizeNoteMongoObject(note) {
        return {...sanitizeMongoObject(note), userId: note.userId.toString()};
    }

    /**
     * Creates a new note document.
     *
     * @param {Object} noteData - The data for the new note.
     * @param {string} noteData.userId - The ID of the user creating the note.
     * @param {string} noteData.title - The title of the note.
     * @param {Array<string>} noteData.tags - An array of tags associated with the note.
     * @param {string} noteData.content - The content of the note.
     * @param {boolean} [noteData.isPinned] - Whether the note is pinned.
     * @returns {Promise<Readonly<Object>>} The created note document, deep-frozen.
     * @throws {Error} If an error occurs during note creation.
     */
    async create(noteData = {}) {
        try {
            const newNote = new this.#model(noteData);
            await newNote.save();
            return this.#sanitizeNoteMongoObject(newNote.toObject());
        } catch (error) {
            console.error("Error creating note:", error);
            throw new Error("Error creating note");
        }
    }

    /**
     * Finds a note by its ID and updates it with the provided fields.
     *
     * @param {string} noteId - The ID of the note to update.
     * @param {Object} updates - The fields to update.
     * @returns {Promise<Readonly<Object|null>>} The updated note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the update.
     */
    async findByIdAndUpdate(noteId, updates = {}) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const updatedNote = await this.#model.findByIdAndUpdate(
                convertToObjectId(noteId),
                {$set: updates}, {
                    new: true,
                    runValidators: true
                }).lean();
            return updatedNote ? deepFreeze(this.#sanitizeNoteMongoObject(updatedNote)) : null;
        } catch (error) {
            console.error("Error updating note:", error);
            throw new Error("Error updating note");
        }
    }

    /**
     * Retrieves a note by its ID.
     *
     * @param {string} noteId - The ID of the note.
     * @returns {Promise<Readonly<Object|null>>} The note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the query.
     */
    async findById(noteId) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const note = await this.#model.findById(convertToObjectId(noteId)).lean();
            return note ? deepFreeze(this.#sanitizeNoteMongoObject(note)) : null;
        } catch (error) {
            console.error("Error finding note by ID:", error);
            throw new Error("Error finding note by ID");
        }
    }

    /**
     * Retrieves a single note matching the provided query.
     *
     * @param {Object} [query={}] - The MongoDB query to filter notes.
     * @returns {Promise<Readonly<Object|null>>} The found note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the query.
     */
    async findOne(query = {}) {
        try {
            const note = await this.#model.findOne(query).lean();
            return note ? deepFreeze(this.#sanitizeNoteMongoObject(note)) : null;
        } catch (error) {
            console.error("Error finding note:", error);
            throw new Error("Error finding note");
        }
    }

    /**
     * Deletes a note by its ID.
     *
     * @param {string} noteId - The ID of the note to delete.
     * @returns {Promise<Readonly<Object|null>>} The deleted note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during deletion.
     */
    async deleteById(noteId) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const deletedNote = await this.#model.findByIdAndDelete(convertToObjectId(noteId)).lean();
            return deletedNote ? deepFreeze(this.#sanitizeNoteMongoObject(deletedNote)) : null;
        } catch (error) {
            console.error("Error deleting note:", error);
            throw new Error("Error deleting note");
        }
    }

    /**
     * Retrieves notes with pagination and sorting.
     *
     * @param {Object} [query={}] - The MongoDB query to filter notes.
     * @param {Object} [options={}] - Pagination and sorting options.
     * @param {number} [options.page=1] - The current page number (1-indexed).
     * @param {number} [options.perPage=10] - The number of notes per page.
     * @param {Object} [options.sort={ createdAt: -1 }] - Sorting criteria.
     * @returns {Promise<Readonly<Object>>} An object containing paginated note data and metadata.
     * @throws {Error} If an error occurs while fetching notes.
     */
    async find(query = {}, options = {}) {
        const {page = 1, perPage = 10, sort = {createdAt: -1}} = options;

        this.#paginator.page = page;
        this.#paginator.perPage = perPage;
        this.#paginator.sort = sort;

        try {
            const result = await this.#paginator.getPagination(query);
            result.data = result.data.map(this.#sanitizeNoteMongoObject);
            return deepFreeze(result);
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw new Error("Error fetching notes");
        }
    }

    /**
     * Retrieves notes matching a search text with additional query filters and pagination.
     *
     * The search is performed on the title and tags fields using a case-insensitive regular expression.
     *
     * @param {string} [searchText=""] - The text to search for.
     * @param {Object} [query={}] - Additional MongoDB query filters.
     * @param {Object} [options={}] - Pagination and sorting options.
     * @param {number} [options.page=1] - The current page number (1-indexed).
     * @param {number} [options.perPage=10] - The number of notes per page.
     * @param {Object} [options.sort={ createdAt: -1 }] - Sorting criteria.
     * @returns {Promise<Readonly<Object>>} An object containing the paginated search results and metadata.
     * @throws {Error} If an error occurs while fetching notes.
     */
    async findWithSearchText(searchText = "", query = {}, options = {}) {
        const {page = 1, perPage = 10, sort = {createdAt: -1}} = options;

        let baseQuery = {...query};

        if (searchText.trim()) {
            // Escape the substring to prevent regex injection
            const sanitizedSearchText = sanitizeString(searchText);

            // Using MongoDB Full-Text Search for efficient lookup
            baseQuery.$text = {$search: sanitizedSearchText};
        }

        this.#paginator.page = page;
        this.#paginator.perPage = perPage;
        this.#paginator.sort = sort;

        try {
            const result = await this.#paginator.getPagination(baseQuery);
            result.data = result.data.map(this.#sanitizeNoteMongoObject);
            return deepFreeze(result);
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw new Error("Error fetching notes");
        }
    }
}

module.exports = new NoteRepository(Note);
