const NotePaginatorService = require("../services/notePaginatorService");
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
     * @type {NotePaginatorService}
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
        this.#paginator = new NotePaginatorService(model);
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
     * @param {boolean} [noteData.isPinned] - The pinned status.
     * @param {boolean} [noteData.isPublic] - The public accessibility
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object>>} The created note document, deep-frozen.
     * @throws {Error} If an error occurs during note creation.
     */
    async create(noteData = {}, session = null) {
        try {
            const newNote = new this.#model(noteData);
            await newNote.save({session});
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
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} The updated note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the update.
     */
    async findByIdAndUpdate(noteId, updates = {}, session = null) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const updatedNote = await this.#model.findByIdAndUpdate(
                convertToObjectId(noteId),
                {$set: updates}, {
                    new: true,
                    runValidators: true,
                    session
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
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} The note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the query.
     */
    async findById(noteId, session = null) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const note = await this.#model.findById(convertToObjectId(noteId)).session(session).lean();
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
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} The found note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during the query.
     */
    async findOne(query = {}, session = null) {
        try {
            const note = await this.#model.findOne(query).session(session).lean();
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
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object|null>>} The deleted note document, deep-frozen, or null if not found.
     * @throws {Error} If an error occurs during deletion.
     */
    async deleteById(noteId, session = null) {
        if (!isValidObjectId(noteId)) return null;

        try {
            const deletedNote = await this.#model.findByIdAndDelete(convertToObjectId(noteId), {session}).lean();
            return deletedNote ? deepFreeze(this.#sanitizeNoteMongoObject(deletedNote)) : null;
        } catch (error) {
            console.error("Error deleting note:", error);
            throw new Error("Error deleting note");
        }
    }

    /**
     * Retrieves notes using MongoDB Atlas Search with optional full-text matching, filters, and pagination.
     *
     * Constructs a `$search` query with compound filtering using Atlas Search's `compound.must` operator.
     * Supports full-text matching on "title" and "tags", along with equality filters like `userId`.
     *
     * @param {string} [searchText] - Text to match in the note fields (title, tags).
     * @param {Object} [query={}] - Object containing equality filters (e.g., { userId }).
     * @param {Object} [options={}] - Pagination and sorting options.
     * @param {number} [options.page=1] - The page number to retrieve (1-based).
     * @param {number} [options.perPage=10] - Number of results per page.
     * @param {Object} [options.sort={isPinned: -1, updatedAt: -1, createdAt: -1}] - Sort criteria.
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object>>} An object containing paginated search results.
     * @throws {Error} If an error occurs while fetching notes.
     */
    async find({searchText, query = {}, options = {}} = {}, session = null) {
        const mustConditions = [];

        if (searchText && searchText.trim()) {
            mustConditions.push({
                text: {
                    query: searchText,
                    path: ['title', 'tags']
                }
            });
        }

        if (query.userId) {
            mustConditions.push({
                equals: {
                    path: "userId",
                    value: convertToObjectId(query.userId)
                }
            });
        }

        return this.#fetchNotes(mustConditions, options, session);
    }

    /**
     * Private helper method to execute the Atlas Search query with pagination.
     * It also ensures the sort object follows the compound index order:
     * { userId, isPinned, createdAt, updatedAt, title, tags }.
     * If a key in the order is undefined, the process stops, preserving index order.
     *
     * @private
     * @param {Array<Object>} mustConditions - Conditions for the `$search.compound.must` clause.
     * @param {Object} options - Pagination and sorting options.
     * @param {import('mongoose').ClientSession} [session] - MongoDB transaction session
     * @returns {Promise<Readonly<Object>>} An object containing the paginated results.
     * @throws {Error} If an error occurs while fetching notes.
     */
    async #fetchNotes(mustConditions, options, session = null) {
        // Set default pagination and sort options
        const {
            page = 1,
            perPage = 10,
            sort = {isPinned: -1, updatedAt: -1, createdAt: -1}
        } = options;

        try {
            const result = await this.#paginator.getPagination(mustConditions, {page, perPage, sort}, session);
            result.data = result.data.map(this.#sanitizeNoteMongoObject);
            return deepFreeze(result);
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw new Error("Error fetching notes");
        }
    }
}

module.exports = NoteRepository;
